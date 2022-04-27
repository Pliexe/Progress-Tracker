import { ModalSubmitInteraction, CacheType } from "discord.js";
import { Modal } from "../modalhandler";
import db from 'quick.db';
import { FeatureStatus } from "../types";

export = class extends Modal {
    constructor() {
        super("add-feature");
    }

    public async execute(interaction: ModalSubmitInteraction<CacheType>): Promise<void> {
        db.push("features", {
            name: interaction.fields.getTextInputValue("feature-name"),
            description: interaction.fields.getTextInputValue("feature-description"),
            status: FeatureStatus.Open
        });

        interaction.reply({ content: "Submited!", ephemeral: true });
    }
}