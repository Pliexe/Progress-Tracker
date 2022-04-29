import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Command } from "../utils/handlers/commandhandler";
import db from 'quick.db';
import { IFeature } from "../types";
import xlsx from 'node-xlsx';
import { getStatusEmote, getStatusString } from "../util";

export = class extends Command {
    constructor() {
        super({
            description: "Clear all features",
            options: []
        })
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const features: IFeature[] = db.get("features");
        
        db.set("features", features.map((x, i) => ({...x, id: i + 1})));

        await interaction.reply("Feature ID's have been reset!");
    }
}