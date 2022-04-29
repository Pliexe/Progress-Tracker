import { ButtonInteraction } from "discord.js";
import { FeatureStatus } from "../../types";
import { Messages } from "../../utils";
import { ComponentEx } from "../../utils/handlers/componenthandler";

export = class extends ComponentEx {
    constructor() {
        super("list-nav-first");
    }

    async execute(interaction: ButtonInteraction, data: string) {
        const [i, f] = data.split("_");
        
        const filter: FeatureStatus | undefined = f ? parseInt(f) : undefined;

        await interaction.update(Messages.List(interaction.user.id, 0, filter));
    }
}