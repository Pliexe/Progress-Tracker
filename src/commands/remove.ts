import { ActionRowData, CommandInteraction, ComponentType, MessageActionRowComponentData } from "discord.js";
import { Command } from "../commandhandler";
import db from 'quick.db';
import { IFeature } from "../types";
import { getStatusEmote } from "../util";
import { showCustomPages } from "../messageColletors";

export = class extends Command {
    constructor() {
        super({
            description: "Remove an feature from the list",
            options: [],
        })
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const features: IFeature[] = db.get("features");

        if(features && features.length > 0) {
            await showCustomPages(interaction, 10, features, (data, row, page, pages, start) => {
                const select: ActionRowData<MessageActionRowComponentData> = { type: ComponentType.ActionRow, components: [{ type: ComponentType.SelectMenu, customId: "list-item", options: data.map((x, i) => ({ label: x.name, emoji: { name: getStatusEmote(x.status) }, description: x.description.substring(0, 100), value: (start + i).toString() }))}] };
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
            }, async (interaction, updatemsg) => {
                if(interaction.isSelectMenu() && interaction.customId === "list-item") {
                    const index = parseInt(interaction.values[0]);
                    const features = db.get("features");;
                    const feature = features[index];
                    features.splice(index, 1);
                    db.set("features", features);

                    if(feature) {
                        await interaction.update({
                            content: "Removed: " + feature.name,
                        });
                    } else {
                        await interaction.reply({ content: "Feature not found", ephemeral: true });
                    }                   
                }
            }, 0)
        } else await interaction.reply("No features have been submitted yet!");
    }
}