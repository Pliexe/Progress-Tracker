import { ButtonInteraction } from "discord.js";
import { FeatureStatus, IFeature } from "../../../types";
import { Messages } from "../../../utils";
import { ComponentEx } from "../../../utils/handlers/componenthandler";
import db from 'quick.db';

export = class extends ComponentEx {
    constructor() {
        super("back-to-item-list");
    }

    async execute(interaction: ButtonInteraction, data: string) {
        const [_, i, f] = data.split("_");

        const index = parseInt(i);
        const filter = parseInt(f);

        await interaction.update(Messages.List(interaction.user.id, index, filter));
    }
}