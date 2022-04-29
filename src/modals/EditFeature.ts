import { ModalSubmitInteraction, CacheType, Message } from "discord.js";
import { Modal } from "../utils/handlers/modalhandler";
import db from 'quick.db';
import { FeatureStatus, IFeature } from "../types";
import { Messages } from "../utils";

export = class extends Modal {
    constructor() {
        super("edit-feature");
    }

    public async execute(interaction: ModalSubmitInteraction<CacheType>, data: string): Promise<void> {
        const [i] = data.split("_");

        const id = parseInt(i);

        const features = (db.get("features") as IFeature[]);
        
        const feature = features.find(x => x.id === id);

        if(!feature) {
            await interaction.reply({ content: "Could not find feature with that id.", ephemeral: true });
            return;
        }

        feature.name = interaction.fields.getTextInputValue("feature-name");
        feature.description = interaction.fields.getTextInputValue("feature-description");

        db.set("features", features);

        await interaction.reply({ content: "Successfully edited!", ephemeral: true });
        await (interaction.message as Message).edit(Messages.Item(interaction.user.id, feature, data));
    }
}