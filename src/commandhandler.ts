import { ApplicationCommandDataResolvable, ApplicationCommandOptionData, CommandInteraction, Guild } from "discord.js";
import { lstatSync, readdirSync } from "fs";
import path from "path";
import { Bot } from "./bot";

interface ICommandOptions {
    description: string;
    options: ApplicationCommandOptionData[];
    aliases?: string[];
}

export class Command {
    public name!: string;
    public description: string;
    public options: ApplicationCommandOptionData[];
    public path!: string;
    public aliases?: string[];

    constructor(options: ICommandOptions) {
        this.description = options.description;
        this.options = options.options;
        this.aliases = options.aliases;
    }
    
    get getCommand(): ApplicationCommandDataResolvable {
        return {
            name: this.name,
            description: this.description,
            options: this.options
        }
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply("This command is not yet implemented.");
        return;
    }
}

const seperator = process.platform === "win32" ? "\\" : "/";

export class CommandHandler {
    private bot: Bot;
    private commands = new Map<string, Command>();
    public aliases: Map<string, string> = new Map();
    
    constructor(bot: Bot) {
        this.bot = bot;
    }

    static readFiles(directory: string): string[] {
        let files: string[] = [];

        readdirSync(directory).forEach(file => {
            const location = path.join(directory, file);

            if (lstatSync(location).isDirectory())
                files = files.concat(CommandHandler.readFiles(location));
            else files.push(location);
        });

        return files;
    }

    setup() {
        const cmdLocations: string[] = CommandHandler.readFiles(path.join(__dirname, "commands")).filter(file => file.endsWith('.js'));
        const importedFiles = cmdLocations.map(require);

        importedFiles.forEach((file, i) => {
            const command: Command = new file();
            command.path = cmdLocations[i];

            this.loadCommand(command);
        });
    }

    private loadCommand(command: Command) {
        
        command.name = command.path.slice(command.path.lastIndexOf(seperator) + 1, command.path.length - 3);
        
        this.commands.set(command.name, command);

        command.aliases?.forEach(alias => this.aliases.set(alias, command.name));

    }

    async registerCommands() {
        for(let [_, guild] of this.bot.guilds.cache) {
            await this.registerGuild(guild);
        }
    }
    
    private async registerGuild(guild: Guild) {
        for(let [_, guild] of this.bot.guilds.cache) {
            await guild.commands.set([...this.commands.values()].map(x => x.getCommand));
        }
    }

    run(interaction: CommandInteraction) {        
        if(interaction.commandName) {
            const command = this.commands.get(interaction.commandName);
    
            if(command) {
                command.execute(interaction);
            }
        }
    }
}