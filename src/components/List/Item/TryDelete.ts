import { ButtonInteraction, ButtonStyle, ComponentType } from "discord.js";
import { FeatureStatus, IFeature } from "../../../types";
import { Messages } from "../../../utils";
import { ComponentEx } from "../../../utils/handlers/componenthandler";
import db from 'quick.db';

export = class extends ComponentEx {
    constructor() {
        super("delete-item");
    }

    async execute(interaction: ButtonInteraction, data: string) {
        const [i] = data.split("_");

        const index = parseInt(i);
        
        const features = db.get(`features`) as IFeature[];

        const feature = features.find(x => x.id === index);

        if(feature) {
            feature.status = FeatureStatus.Done;
            await interaction.update({
                embeds: [{ description: "Are you sure you want to delete this feature?", color: 0xff0000 }],
                components: [{
                    type: ComponentType.ActionRow,
                    components: [{
                        type: ComponentType.Button,
                        label: "Yes",
                        customId: "yes-delete-item:" + interaction.user.id + ":" + data,
                        style: ButtonStyle.Danger
                    }, {
                        type: ComponentType.Button,
                        label: "No",
                        customId: "no-delete-item:" + interaction.user.id + ":" + data,
                        style: ButtonStyle.Success
                    }]
                }]
            });
        } else await interaction.update({ content: "No features have been submitted yet or non match the filter!", embeds: [], components: [] });
    }
}