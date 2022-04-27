import { ModalSubmitInteraction, CacheType } from "discord.js";
import { Modal } from "../modalhandler";
import db from 'quick.db';
import { FeatureStatus, IFeature } from "../types";

export = class extends Modal {
    constructor() {
        super("add-feature");
    }

    public async execute(interaction: ModalSubmitInteraction<CacheType>): Promise<void> {
        const highestId = db.get("features")?.reduce((acc: number, cur: IFeature) => Math.max(acc, cur.id), 0) || 0;
        
        db.push("features", {
            name: interaction.fields.getTextInputValue("feature-name"),
            description: interaction.fields.getTextInputValue("feature-description"),
            status: FeatureStatus.Open,
            id: highestId + 1
        });

        interaction.reply({ content: "Submited!", ephemeral: true });
    }
}