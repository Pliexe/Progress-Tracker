import { ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import { CommandInteraction, ComponentType, Constants, InteractionType, ModalAssertions, TextInputStyle } from "discord.js";
import { Command } from "../utils/handlers/commandhandler";

export = class extends Command {
    constructor() {
        super({
            description: "Add a new feature",
            options: [],
        })
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.showModal({
            title: "Add a new feature",
            customId: "add-feature",
            components: [{
                type: ComponentType.ActionRow,
                components: [{
                    type: ComponentType.TextInput,
                    customId: "feature-name",
                    label: "Feature name",
                    style: TextInputStyle.Short,
                    maxLength: 100
                }]
            }, {
                type: ComponentType.ActionRow,
                components: [{
                    type: ComponentType.TextInput,
                    customId: "feature-description",
                    label: "Feature description",
                    style: TextInputStyle.Paragraph,
                    maxLength: 4000 // Discord limits embed field value to 4096 characters
                }]
            }]
        })
    }
}