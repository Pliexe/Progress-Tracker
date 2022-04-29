import { ButtonInteraction, ButtonStyle, ComponentType } from "discord.js";
import { FeatureStatus, IFeature } from "../../../types";
import { Messages } from "../../../utils";
import { ComponentEx } from "../../../utils/handlers/componenthandler";
import db from 'quick.db';

export = class extends ComponentEx {
    constructor() {
        super("yes-delete-item");
    }

    async execute(interaction: ButtonInteraction, data: string) {
        const [i] = data.split("_");

        const index = parseInt(i);
        
        const features = db.get(`features`) as IFeature[];

        const feature = features.find(x => x.id === index);

        if(feature) {
            features.splice(features.findIndex(x => x.id === index), 1);
            db.set(`features`, features);
            
            await interaction.update({
                embeds: [{ description: `Item ${feature.name} deleted!`, color: 0xff0000 }],
                components: [{
                    type: ComponentType.ActionRow,
                    components: [{
                        type: ComponentType.Button,
                        label: "Back",
                        customId: "back-to-item-list:" + interaction.user + ":" + data,
                        style: ButtonStyle.Success,
                        emoji: { name: "🔙" }
                    }]
                }]
            });
        } else await interaction.update({ content: "No features have been submitted yet or non match the filter!", embeds: [], components: [] });
    }
}