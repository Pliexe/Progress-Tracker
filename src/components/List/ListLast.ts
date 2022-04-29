import { ButtonInteraction } from "discord.js";
import db from 'quick.db';
import { FeatureStatus, IFeature } from "../../types";
import { Messages } from "../../utils";
import { ComponentEx } from "../../utils/handlers/componenthandler";

export = class extends ComponentEx {
    constructor() {
        super("list-nav-last");
    }

    async execute(interaction: ButtonInteraction, data: string) {
        const [i, f] = data.split("_");
        
        const filter: FeatureStatus | undefined = f ? parseInt(f) : undefined;

        const features = db.get("features") as IFeature[] | undefined;
        
        const filtered = features && filter !== undefined ? features.filter(x => x.status === filter) : features;

        await interaction.update(Messages.List(interaction.user.id, filtered ? Math.ceil(filtered.length / 10) - 1 : 0, filter));
    }
}