import { ActionRowData, ApplicationCommandOptionType, ButtonStyle, CommandInteraction, ComponentType, Constants, MessageActionRowComponentData, TextInputStyle } from "discord.js";
import { Command } from "../commandhandler";
import db from 'quick.db';
import { FeatureStatus, IFeature } from "../types";
import { getStatusEmote } from "../util";
import { showCustomPages } from "../messageColletors";

export = class extends Command {
    constructor() {
        super({
            description: "List of features and their status",
            options: [{
                type: ApplicationCommandOptionType.Integer,
                choices: [{ name: "Open", value: FeatureStatus.Open }, { name: "In-Progress", value: FeatureStatus.InProgress }, { name: "Done", value: FeatureStatus.Done }],
                description: "Filter for features by status",
                name: "status"
            }],
        })
    }

    public async execute(interaction: CommandInteraction): Promise<void> {

        const features: IFeature[] = db.get("features");
        const filter = interaction.options.get("status", false)?.value;        
        const filtered = features && filter !== undefined ? features.filter(x => x.status === filter) : features;

        if(filtered && filtered.length > 0) {
            
            await showCustomPages(interaction, 10, filtered, (data, row, page, pages, start) => {
                const select: ActionRowData<MessageActionRowComponentData> = { type: ComponentType.ActionRow, components: [{ type: ComponentType.SelectMenu, customId: "list-item", options: data.map((x, i) => ({ label: x.name, emoji: { name: getStatusEmote(x.status) }, description: x.description.substring(0, 100), value: x.id.toString() }))}] };
                return {
                    embeds: [{
                        title: "Features",
                        fields: data.map(feature => ({
                            name: `${getStatusEmote(feature.status)} ${feature.name}`,
                            value: `${feature.description.substring(0, 150)}${feature.description.length > 150 ? "..." : ""}`
                        }))
                    }],
                    components: row ? [row, select] : [select]
                }
            }, async (interaction, updatemsg) => {
                if((interaction.isSelectMenu() && interaction.customId === "list-item") || (interaction.isButton() && (interaction.customId.startsWith("done:") || interaction.customId.startsWith("in-progress:")))) {
                    const id = parseInt(interaction.isSelectMenu() ? interaction.values[0] : interaction.customId.split(":")[1]);
                    const feature = filtered.find(x => x.id === id);
                    if(feature) {
                        if(interaction.isButton()) {
                            if(interaction.customId.startsWith("done:")) {
                                feature.status = FeatureStatus.Done;
                            } else if(interaction.customId.startsWith("in-progress:")) {
                                feature.status = FeatureStatus.InProgress;
                            } else if(interaction.customId.startsWith("delete:")) {
                                features.splice(features.findIndex(x => x.id === id), 1);
                            } else if(interaction.customId.startsWith("edit:")) {
                                await interaction.showModal({
                                    title: "Edit Feature",
                                    customId: "edit-feature:"+id.toString(),
                                    components: [{
                                        type: ComponentType.ActionRow,
                                        components: [{
                                            type: ComponentType.TextInput,
                                            label: "Feature name",
                                            customId: "feature-name",
                                            style: TextInputStyle.Short,
                                            maxLength: 100,
                                            value: feature.name,
                                        }, {
                                            type: ComponentType.TextInput,
                                            label: "Feature description",
                                            customId: "feature-description",
                                            style: TextInputStyle.Paragraph,
                                            maxLength: 4000, // Discord limits embed field value to 4096 characters
                                            value: feature.description,
                                        }]
                                    }]
                                });
                                return;
                            }
                            db.set("features", features);
                        }
                        await interaction.update({
                            embeds: [{
                                title: `${getStatusEmote(feature.status)} ${feature.name}`,
                                description: feature.description ?? "No description provided",
                            }],
                            components: [{
                                type: ComponentType.ActionRow,
                                components: [{
                                    type: ComponentType.Button,
                                    label: "Mark as In-Progress",
                                    customId: "in-progress:"+feature.id,
                                    style: ButtonStyle.Secondary,
                                    disabled: !(feature.status === FeatureStatus.Open),
                                    emoji: { name: "🕐" }
                                }, {
                                    type: ComponentType.Button,
                                    label: "Mark as Done",
                                    customId: "done:"+feature.id,
                                    style: ButtonStyle.Secondary,
                                    disabled: !(feature.status === FeatureStatus.InProgress),
                                    emoji: { name: "✅" }
                                }, {
                                    type: ComponentType.Button,
                                    label: "Edit",
                                    customId: "edit:"+feature.id,
                                    style: ButtonStyle.Danger,
                                    disabled: (feature.status === FeatureStatus.Done),
                                    emoji: { name: "✍️" }
                                }, {
                                    type: ComponentType.Button,
                                    label: "Delete",
                                    customId: "delete:"+feature.id,
                                    style: ButtonStyle.Danger,
                                    disabled: (feature.status === FeatureStatus.Done),
                                    emoji: { name: "❌" }
                                }, {
                                    type: ComponentType.Button,
                                    label: "Back",
                                    customId: "back",
                                    style: ButtonStyle.Success,
                                    emoji: { name: "🔙" }
                                }]
                            }]
                        });
                    } else {
                        await interaction.reply({ content: "Feature not found", ephemeral: true });
                    }
                } else if(interaction.isButton() && interaction.customId === "back") {
                    return { back: true, newData: (filter !== undefined ? features.filter(x => x.status === filter) : features) };
                }
            }, 0)
        } else await interaction.reply("No features have been submitted yet or non match the filter!");
    }
}