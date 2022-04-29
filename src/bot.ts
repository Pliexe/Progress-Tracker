import { Client, ClientOptions } from "discord.js";
import { CommandHandler } from "./utils/handlers/commandhandler";
import { ModalHandler } from "./utils/handlers/modalhandler";
import { delay } from "./util";
import { ComponentHandler } from "./utils/handlers/componenthandler";

export class Bot extends Client {
    public commandHandler = new CommandHandler(this);
    public modalHandler = new ModalHandler();
    public componentHandler = new ComponentHandler();
    
    constructor(options: ClientOptions) {
        super(options);

        this.commandHandler.setup();
        this.modalHandler.setup();
        this.componentHandler.setup();

        this.on("ready", async () => {
            console.log("Ready!");
            
            await delay(1000);
            await this.commandHandler.registerCommands();
        });

        this.on("interactionCreate", async interaction => {
            if(interaction.isCommand()) {
                this.commandHandler.run(interaction);
            } else if(interaction.isModalSubmit()) {
                this.modalHandler.run(interaction);
            } else if(interaction.isMessageComponent()) {
                this.componentHandler.run(interaction);
            }
        });
    }
}