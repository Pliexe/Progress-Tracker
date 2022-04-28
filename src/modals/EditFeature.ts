import { ModalSubmitInteraction, CacheType } from "discord.js";
import { Modal } from "../modalhandler";
import db from 'quick.db';
import { FeatureStatus, IFeature } from "../types";

export = class extends Modal {
    constructor() {
        super("edit-feature");
    }

    public async execute(interaction: ModalSubmitInteraction<CacheType>, data: string): Promise<void> {
        const id = parseInt(data);
        const feature = (db.get("features") as IFeature[] | undefined)?.find(x => x.id === id);

        if(!feature) {
            await interaction.reply({ content: "Could not find feature with that id.", ephemeral: true });
            return;
        }

        feature.name = interaction.fields.getTextInputValue("feature-name");
        feature.description = interaction.fields.getTextInputValue("feature-description");

        interaction.reply({ content: "Successfully edited!", ephemeral: true });
    }
}