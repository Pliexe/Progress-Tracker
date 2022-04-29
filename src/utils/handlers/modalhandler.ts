import { ModalSubmitInteraction } from "discord.js";
import path from "path";
import { CommandHandler } from "./commandhandler";

export class Modal {
    public customId!: string;

    constructor(customId: string) {
        this.customId = customId;
    }

    public async execute(interaction: ModalSubmitInteraction, data?: string | undefined): Promise<void> {
        await interaction.reply("This command is not yet implemented.");
        return;
    }
}

export class ModalHandler {
    private modals = new Map<string, Modal>();

    setup() {
        const cmdLocations: string[] = CommandHandler.readFiles(path.join(__dirname, "../../modals")).filter(file => file.endsWith('.js'));
        const importedFiles = cmdLocations.map(require);

        importedFiles.forEach((file, i) => {
            const command: Modal = new file();

            this.loadCommand(command);
        });
    }

    private loadCommand(modal: Modal) {
        
        modal.customId = modal.customId;
        
        this.modals.set(modal.customId, modal);
    }

    run(interaction: ModalSubmitInteraction) {
        const [modal, data] = interaction.customId.split(":");
        
        const command = this.modals.get(modal);

        if(command) {
            command.execute(interaction, data);
        }
    }
}