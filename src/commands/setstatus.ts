import { ActionRowData, ApplicationCommandOptionType, ButtonStyle, CommandInteraction, ComponentType, Constants, MessageActionRowComponentData } from "discord.js";
import { Command } from "../commandhandler";
import db from 'quick.db';
import { FeatureStatus, IFeature } from "../types";
import { getStatusEmote } from "../util";
import { showCustomPages } from "../messageColletors";

export = class extends Command {
    constructor() {
        super({
            description: "Set status of a feature",
            options: [{
                type: ApplicationCommandOptionType.Integer,
                choices: [{ name: "Open", value: FeatureStatus.Open }, { name: "In-Progress", value: FeatureStatus.InProgress }, { name: "Done", value: FeatureStatus.Done }],
                description: "The new status of the feature",
                name: "status",
                required: true
            }],
        })
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const rawFeatures: IFeature[] = db.get("features");

        const features = rawFeatures?.filter(x => x.status !== FeatureStatus.Done);

        if(features && features.length > 0) {
            await showCustomPages(interaction, 10, features, (data, row, page, pages, start) => {
                const select: ActionRowData<MessageActionRowComponentData> = { type: ComponentType.ActionRow, components: [{ type: ComponentType.SelectMenu, customId: "list-item", options: data.map((x, i) => ({ label: x.name, emoji: { name: getStatusEmote(x.status) }, description: x.description.substring(0, 100), value: x.id.toString() }))}] };
                return {
                    embeds: [{
                        title: "Select an feature to start working on!",
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
                    const status = interaction.options.get("status", true).value as number;
                    
                    if(feature) {
                        feature.status = status;
                        switch(status) {
                            case FeatureStatus.InProgress:
                                feature.startDate = Date.now();
                                break;
                            case FeatureStatus.Done:
                                feature.endDate = Date.now();
                                break;
                        }

                        db.set("features", features);

                        await selectinteraction.update({
                            content: "Feature status set to: " + interaction.options.get("status", true).name,
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
                } else if(interaction.isButton() && interaction.customId === "back") {
                    return { back: true, newData: (db.get("features") as IFeature[]).filter(x => x.status !== FeatureStatus.Done) };
                }
            }, 0)
        } else await interaction.reply("No features have been submitted yet!");
    }
}