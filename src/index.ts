import { Partials } from "discord.js";
// import dotenv from "dotenv";
import { Bot } from "./bot";
// dotenv.config();

if(process.env.BOT_TOKEN !== undefined) {

    const client = new Bot({
        intents: ["GuildMessages", "GuildMembers", "Guilds"],
        partials: [Partials.Message, Partials.GuildMember, Partials.GuildScheduledEvent]
    });
    
    client.login(process.env.BOT_TOKEN);

} else console.error("Please set the BOT_TOKEN environment variable.");
