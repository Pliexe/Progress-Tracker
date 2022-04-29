import { ActionRowBuilder } from "@discordjs/builders";
import db from 'quick.db';
import { ActionRow, ActionRowData, ComponentType, MessageActionRowComponentData, MessageActionRowComponentBuilder, Snowflake, ButtonComponentData, ButtonStyle, Colors } from "discord.js";
import { FeatureStatus, IFeature } from "../../types";
import { getStatusEmote } from "../../util";

export const List = (authorId: Snowflake, index: number, filter?: FeatureStatus) => {
    const features: IFeature[] = db.get("features");    
    
    const filtered = features && filter !== undefined && !isNaN(filter) ? features.filter(x => x.status === filter) : features;

    const select: ActionRowData<MessageActionRowComponentData> = { type: ComponentType.ActionRow, components: [{ type: ComponentType.SelectMenu, customId: "list-item:" + authorId + ":" + index + "_" + (filter ?? ""), options: filtered.map((x, i) => ({ label: x.name, emoji: { name: getStatusEmote(x.status) }, description: x.description.substring(0, 100), value: x.id.toString() }))}] };

    const maxPages = Math.ceil(filtered.length / 10);
    const startingIndex = index * 10;
    
    if(filtered.length > 0) {
        const nav: ActionRowData<ButtonComponentData> = {
            type: ComponentType.ActionRow,
            components: [{
                type: ComponentType.Button,
                label: "⏮️",
                customId: "list-nav-first:" + authorId + ":" + index + "_" + (filter ?? ""),
                style: index > 1 ? ButtonStyle.Primary : ButtonStyle.Secondary,
                disabled: index < 2
            }, {
                type: ComponentType.Button,
                label: "◀️",
                customId: "list-nav-prev:" + authorId + ":" + index + "_" + (filter ?? ""),
                style: index > 0 ? ButtonStyle.Primary : ButtonStyle.Secondary,
                disabled: index < 1
            }, {
                type: ComponentType.Button,
                emoji: { name: '📖' },
                label: `Page ${index + 1} of ${maxPages}`,
                customId: "list-nav-page-page-temp",
                disabled: true,
                style: ButtonStyle.Secondary
            }, {
                type: ComponentType.Button,
                label: "▶️",
                customId: "list-nav-next:" + authorId + ":" + index + "_" + (filter ?? ""),
                style: index < maxPages - 1 ? ButtonStyle.Primary : ButtonStyle.Secondary,
                disabled: index >= maxPages - 1
            }, {
                type: ComponentType.Button,
                label: "⏭️",
                customId: "list-nav-last:" + authorId + ":" + index + "_" + (filter ?? ""),
                style: index < maxPages - 2 ? ButtonStyle.Primary : ButtonStyle.Secondary,
                disabled: index >= maxPages - 2
            }]
        }        
    
        return {
            embeds: [{
                title: "Features",
                fields: filtered.slice(startingIndex, startingIndex + 10).map(feature => ({
                    name: `${getStatusEmote(feature.status)} ${feature.name}`,
                    value: `${feature.description.substring(0, 150)}${feature.description.length > 150 ? "..." : ""}`
                })),
                color: Colors.Orange
            }],
            components: [nav, select]
        }
    } else {
        return {
            embeds: [{
                title: "Features",
                description: "There are no features to display.",
                color: Colors.Red
            }],
            components: []
        }
    }
}