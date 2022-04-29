import { ActionRowData, ButtonStyle, ComponentType, MessageActionRowComponentData, Snowflake } from "discord.js";
import { FeatureStatus, IFeature } from "../../types";
import { getStatusEmote } from "../../util";

export const Item = (authorId: Snowflake, feature: IFeature, data: string) => {
    const row: ActionRowData<MessageActionRowComponentData> = {
        type: ComponentType.ActionRow,
        components: [{
            type: ComponentType.Button,
            label: "Mark as In-Progress",
            customId: "list-item-mark-in-progress:" + authorId + ":" + data,
            style: ButtonStyle.Secondary,
            disabled: !(feature.status === FeatureStatus.Open),
            emoji: { name: "🕐" }
        }, {
            type: ComponentType.Button,
            label: "Mark as Done",
            customId: "list-item-mark-as-done:" + authorId + ":" + data,
            style: ButtonStyle.Secondary,
            disabled: !(feature.status === FeatureStatus.InProgress),
            emoji: { name: "✅" }
        }, {
            type: ComponentType.Button,
            label: "Edit",
            customId: "edit-item:" + authorId + ":" + data,
            style: ButtonStyle.Primary,
            disabled: (feature.status === FeatureStatus.Done),
            emoji: { name: "✍️" }
        }, {
            type: ComponentType.Button,
            label: "Delete",
            customId: "delete-item:" + authorId + ":" + data,
            style: ButtonStyle.Danger,
            disabled: (feature.status === FeatureStatus.Done),
            emoji: { name: "🇽" }
        }, {
            type: ComponentType.Button,
            label: "Back",
            customId: "back-to-item-list:" + authorId + ":" + data,
            style: ButtonStyle.Success,
            emoji: { name: "🔙" }
        }]
    };
    
    return {
        embeds: [{
            title: `${getStatusEmote(feature.status)} ${feature.name}`,
            description: feature.description ?? "No description provided",
        }],
        components: [row]
    }
}