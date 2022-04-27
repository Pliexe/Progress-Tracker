import { Client, ClientOptions } from "discord.js";
import { CommandHandler } from "./commandhandler";
import { ModalHandler } from "./modalhandler";
import { delay } from "./util";

export class Bot extends Client {
    public commandHandler = new CommandHandler(this);
    public modalHandler = new ModalHandler();
    
    constructor(options: ClientOptions) {
        super(options);

        this.commandHandler.setup();
        this.modalHandler.setup();

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
            }
        });
    }
}