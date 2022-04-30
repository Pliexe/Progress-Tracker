import { ActionRowData, ApplicationCommandOptionType, ButtonStyle, CommandInteraction, ComponentType, MessageActionRowComponentData } from "discord.js";
import { Command } from "../utils/handlers/commandhandler";
import db from 'quick.db';
import { IFeature } from "../types";
import { getStatusEmote } from "../util";
import { showCustomPages } from "../messageColletors";

export = class extends Command {
    constructor() {
        super({
            description: "Set feature start or end date",
            options: [{
                type: ApplicationCommandOptionType.Integer,
                choices: [{ name: "Start Date", value: 0 }, { name: "End Date", value: 1 }],
                name: "type",
                description: "Date type",
                required: true
            }, {
                type: ApplicationCommandOptionType.Integer,
                name: "date",
                description: "The date to set the feature to",
                required: true
            }],
        })
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const features: IFeature[] = db.get("features");

        if(features && features.length > 0) {
            await showCustomPages(interaction, 10, features, (data, row, page, pages, start) => {
                const select: ActionRowData<MessageActionRowComponentData> = { type: ComponentType.ActionRow, components: [{ type: ComponentType.SelectMenu, customId: "list-item", options: data.map((x, i) => ({ label: x.name, emoji: { name: getStatusEmote(x.status) }, description: x.description.substring(0, 100), value: x.id.toString() }))}] };
                return {
                    embeds: [{
                        title: "Select an feature to remove it!",
                        fields: data.map(feature => ({
                            name: `${getStatusEmote(feature.status)} ${feature.name}`,
                            value: feature.description
                        }))
                    }],
                    components: row ? [row, select] : [select]
                }
            }, async (selectinteraction, updatemsg) => {
                if(selectinteraction.isSelectMenu() && selectinteraction.customId === "list-item") {
                    const index = parseInt(selectinteraction.values[0]);
                    const features = db.get("features") as IFeature[];
                    const feature = features.find(x => x.id === index);
                    
                    
                    if(feature) {
                        if(interaction.options.get("type", true).value === 0) {
                            feature.startDate = interaction.options.get("date", true).value as number;
                        } else {
                            feature.endDate = interaction.options.get("date", true).value as number;
                        }
    
                        db.set("features", features);

                        await selectinteraction.update({
                            content: "Set date for: " + feature.name + " to: " + new Date(interaction.options.get("date", true).value as number).toLocaleDateString(),
                            embeds: [],
                            components: [{
                                type: ComponentType.ActionRow,
                                components: [{
                                    type: ComponentType.Button,
                                    label: "Back",
                                    customId: "back",
                                    style: ButtonStyle.Success
                                }]
                            }]
                        });
                    } else {
                        await selectinteraction.reply({ content: "Feature not found", ephemeral: true });
                    }                   
                } else if(selectinteraction.isButton() && selectinteraction.customId === "back") {
                    return { back: true, newData: db.get("features") };
                }
            }, 0)
        } else await interaction.reply("No features have been submitted yet!");
    }
}