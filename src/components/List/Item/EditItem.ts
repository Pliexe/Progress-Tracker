import { ButtonInteraction, ComponentType, TextInputStyle } from "discord.js";
import { FeatureStatus, IFeature } from "../../../types";
import { Messages } from "../../../utils";
import { ComponentEx } from "../../../utils/handlers/componenthandler";
import db from 'quick.db';

export = class extends ComponentEx {
    constructor() {
        super("edit-item");
    }

    async execute(interaction: ButtonInteraction, data: string) {
        const [i] = data.split("_");

        const index = parseInt(i);
        
        const features = db.get(`features`) as IFeature[];

        const feature = features.find(x => x.id === index);

        if(feature) {
            await interaction.showModal({
                title: "Edit feature",
                customId: "edit-feature:" + data,
                components: [{
                    type: ComponentType.ActionRow,
                    components: [{
                        type: ComponentType.TextInput,
                        customId: "feature-name",
                        label: "Feature name",
                        style: TextInputStyle.Short,
                        value: feature.name,
                        maxLength: 100
                    }]
                }, {
                    type: ComponentType.ActionRow,
                    components: [{
                        type: ComponentType.TextInput,
                        customId: "feature-description",
                        label: "Feature description",
                        style: TextInputStyle.Paragraph,
                        value: feature.description,
                        maxLength: 4000 // Discord limits embed field value to 4096 characters
                    }]
                }]
            });
        } else await interaction.update({ content: "No features have been submitted yet or non match the filter!", embeds: [], components: [] });
    }
}