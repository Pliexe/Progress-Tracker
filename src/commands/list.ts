import { ActionRowData, ApplicationCommandOptionType, ButtonStyle, Colors, CommandInteraction, ComponentType, Constants, MessageActionRowComponentData, TextInputStyle } from "discord.js";
import { Command } from "../utils/handlers/commandhandler";
import db from 'quick.db';
import { FeatureStatus, IFeature } from "../types";
import { getStatusEmote } from "../util";
import { showCustomPages } from "../messageColletors";
import { Messages } from "../utils";

export = class extends Command {
    constructor() {
        super({
            description: "List of features and their status",
            options: [{
                type: ApplicationCommandOptionType.Integer,
                choices: [{ name: "Open", value: FeatureStatus.Open }, { name: "In-Progress", value: FeatureStatus.InProgress }, { name: "Done", value: FeatureStatus.Done }],
                description: "Filter for features by status",
                name: "status"
            }],
        })
    }

    public async execute(interaction: CommandInteraction): Promise<void> {

        let filter = (interaction.options.get("status", false)?.value as FeatureStatus | undefined) ?? undefined;
        
        await interaction.reply(Messages.List(interaction.user.id, 0, filter));
        return;
    }
}