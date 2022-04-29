import { MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import path from "path";
import { CommandHandler } from "./commandhandler";

export class ComponentEx {
    public customId!: string;

    constructor(customId: string) {
        this.customId = customId;
    }

    public async execute(interaction: MessageComponentInteraction, data?: string | undefined): Promise<void> {
        await interaction.reply("This command is not yet implemented.");
        return;
    }
}

export class ComponentHandler {
    private components = new Map<string, ComponentEx>();

    setup() {
        const cmdLocations: string[] = CommandHandler.readFiles(path.join(__dirname, "../../components")).filter(file => file.endsWith('.js'));
        const importedFiles = cmdLocations.map(require);

        importedFiles.forEach((file, i) => {
            const command: ComponentEx = new file();

            this.loadCommand(command);
        });
    }

    private loadCommand(modal: ComponentEx) {
        
        modal.customId = modal.customId;
        
        this.components.set(modal.customId, modal);
    }

    run(interaction: MessageComponentInteraction) {
        const [component, authorId, data] = interaction.customId.split(":");

        if(authorId !== interaction.user.id) {
            interaction.reply({
                ephemeral: true,
                content: "You may not interact with this menu."
            });
            return;
        }

        const command = this.components.get(component);

        if(command) {
            command.execute(interaction, data);
        }
    }
}