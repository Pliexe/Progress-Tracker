import { ButtonInteraction, SelectMenuInteraction } from "discord.js";
import { FeatureStatus, IFeature } from "../../../types";
import { Messages } from "../../../utils";
import { ComponentEx } from "../../../utils/handlers/componenthandler";
import db from 'quick.db';

export = class extends ComponentEx {
    constructor() {
        super("list-item");
    }

    async execute(interaction: SelectMenuInteraction, data: string) {
        const index = parseInt(interaction.values[0]);
        
        const features = db.get(`features`) as IFeature[];

        const feature = features.find(x => x.id === index);

        if(feature) {
            await interaction.update(Messages.Item(interaction.user.id, feature, index.toString() + "_" + data));
        } else await interaction.update({ content: "No features have been submitted yet or non match the filter!", embeds: [], components: [] });
    }
}