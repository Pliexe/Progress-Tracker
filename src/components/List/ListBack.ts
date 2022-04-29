import { ButtonInteraction } from "discord.js";
import { FeatureStatus } from "../../types";
import { Messages } from "../../utils";
import { ComponentEx } from "../../utils/handlers/componenthandler";

export = class extends ComponentEx {
    constructor() {
        super("list-nav-prev");
    }

    async execute(interaction: ButtonInteraction, data: string) {
        const [i, f] = data.split("_");

        const index = parseInt(i) - 1;
        const filter: FeatureStatus | undefined = f ? parseInt(f) : undefined;

        await interaction.update(Messages.List(interaction.user.id, index, filter));
    }
}