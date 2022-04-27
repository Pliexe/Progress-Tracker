import { ActionRowData, ApplicationCommandOptionType, CommandInteraction, ComponentType, Constants, MessageActionRowComponentData } from "discord.js";
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
                const select: ActionRowData<MessageActionRowComponentData> = { type: ComponentType.ActionRow, components: [{ type: ComponentType.SelectMenu, customId: "list-item", options: data.map((x, i) => ({ label: x.name, emoji: { name: getStatusEmote(x.status) }, description: x.description.substring(0, 100), value: (start + i).toString() }))}] };
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
                    const feature = features[index];
                    const status = interaction.options.get("status", true).value as number;
                    
                    features[index].status = status;
                    switch(status) {
                        case FeatureStatus.InProgress:
                            features[index].startDate = Date.now();
                            break;
                        case FeatureStatus.Done:
                            features[index].endDate = Date.now();
                            break;
                    }

                    db.set("features", features);

                    if(feature) {
                        await selectinteraction.reply({
                            content: "Feature status set to: " + interaction.options.get("status", true).name,
                        });
                    } else {
                        await selectinteraction.reply({ content: "Feature not found", ephemeral: true });
                    }                   
                }
            }, 0)
        } else await interaction.reply("No features have been submitted yet!");
    }
}