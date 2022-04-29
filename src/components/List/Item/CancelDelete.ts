import { ButtonInteraction, ButtonStyle, ComponentType } from "discord.js";
import { FeatureStatus, IFeature } from "../../../types";
import { Messages } from "../../../utils";
import { ComponentEx } from "../../../utils/handlers/componenthandler";
import db from 'quick.db';

export = class extends ComponentEx {
    constructor() {
        super("no-delete-item");
    }

    async execute(interaction: ButtonInteraction, data: string) {
        const [i] = data.split("_");

        const index = parseInt(i);
        
        const features = db.get(`features`) as IFeature[];

        const feature = features.find(x => x.id === index);

        if(feature) {
            await interaction.update(Messages.Item(interaction.user.id, feature, data));
        } else await interaction.update({ content: "No features have been submitted yet or non match the filter!", embeds: [], components: [] });
    }
}