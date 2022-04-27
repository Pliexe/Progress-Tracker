import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Command } from "../commandhandler";
import db from 'quick.db';
import { IFeature } from "../types";
import xlsx from 'node-xlsx';
import { getStatusEmote, getStatusString } from "../util";

export = class extends Command {
    constructor() {
        super({
            description: "Export to a file",
            options: [{
                type: ApplicationCommandOptionType.Integer,
                choices: [{ name: "Excel", value: 1 }, { name: 'Text', value: 2 }, { name: 'JSON', value: 3 }],
                description: "File format to export in!",
                required: true,
                name: "format"
            }]
        })
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const features: IFeature[] = db.get("features");
        if(features && features.length <= 0) {
            await interaction.reply("No features have been submitted yet!");
            return;
        }

        
        switch(interaction.options.get("format", true).value as number) {
            case 1:
            {
                const excelFileBuffer = xlsx.build([{name: "Features", data: [["Id", "Name", "Description", "Status", "Start Date", "End Date"],...features.map(x => [x.id, x.name, x.description, getStatusString(x.status), x.startDate ? new Date(x.startDate) : "", x.endDate ? new Date(x.endDate) : ""])], options: { '!cols': [{wch: 4}, { wch: 20} , {wch: 50}, {wch: 6}, {wch: 10}, {wch: 10}] }}])

                await interaction.reply({
                    files: [{ attachment: excelFileBuffer, name: "features.xlsx", contentType: "xlsx" }]
                });
            }
            break;
            case 2:
            {
                const text = features.map(x => `#${x.id} | ${x.startDate ? `${new Date(x.startDate).toLocaleDateString("en-UK")} ${new Date(x.startDate).toLocaleTimeString("en-UK")}` : "??"} - ${x.endDate ? `${new Date(x.endDate).toLocaleDateString("en-UK")} ${new Date(x.endDate).toLocaleTimeString("en-UK")}` : "??"} => (${getStatusString(x.status)}) (${getStatusEmote(x.status)}) ${x.name}:\n\t${x.description}`).join("\n================================================\n");
                await interaction.reply({
                    files: [{ attachment: Buffer.from(text), name: "features.txt", contentType: "text/plain" }]
                });
            }
            break;
            case 3:
            {
                const object: { [key: number]: IFeature } = {};
                features.forEach((x, i) => {
                    object[i] = x;
                })
                await interaction.reply({
                    files: [{ attachment: Buffer.from(JSON.stringify(object, null, 2)), name: "features.json", contentType: "application/json" }]
                });
            }
            break;
        }
    }
}