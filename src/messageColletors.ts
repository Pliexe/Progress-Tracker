import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { APIActionRowComponent, APIEmbed, APIMessageActionRowComponent, APIMessageComponent } from "discord-api-types/v10";
import { ButtonStyle, CommandInteraction, ComponentType, Emoji, AnyComponentBuilder, Message, MessageActionRowComponentBuilder, MessageComponentInteraction, JSONEncodable, CacheType, ActionRowData, MessageActionRowComponentData } from "discord.js";

export function showPages<T>(interaction: CommandInteraction | MessageComponentInteraction, itemsPerPage: number, data: T[], embed: (data: T[], page: number, pages: number, start: number) => (Promise<EmbedBuilder> | EmbedBuilder), index = 0): Promise<void> {
    return new Promise(async (res, rej) => {
        try {
            if (index < 0) {
                res();
            }

            if (itemsPerPage >= data.length) {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents([
                        new ButtonBuilder()
                            .setLabel(`Page 1 out of 1`)
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId("currentPage")
                            .setEmoji({ name: "📖" })
                            .setDisabled(true)]);
                            
                if(interaction instanceof MessageComponentInteraction) {
                    interaction.update({
                        embeds: [await embed(data, 0, 1, 0)],
                        components: [row]
                    });
                } else {
                    await interaction.reply({
                        embeds: [await embed(data, 0, 1, 0)],
                        components: [row]
                    });
                }
                res();
                return;
            }

            const pages = getPages(itemsPerPage, data.length);

            const getRow = () => new ActionRowBuilder<ButtonBuilder>()
                .addComponents([
                    new ButtonBuilder()
                        .setLabel("First page")
                        .setCustomId("first")
                        .setEmoji({ name: "⏮️" })
                        .setStyle(index < 2 ? ButtonStyle.Secondary : ButtonStyle.Primary)
                        .setDisabled(index < 2),
                    new ButtonBuilder()
                        .setLabel("Previous")
                        .setCustomId("previous")
                        .setEmoji({ name: "◀️" })
                        .setStyle(index < 1 ? ButtonStyle.Secondary : ButtonStyle.Primary)
                        .setDisabled(index < 1),
                    new ButtonBuilder()
                        .setLabel(`Page ${index + 1} out of ${pages}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId("currentPage")
                        .setEmoji({ name: "📖" })
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setLabel("Next")
                        .setCustomId("next")
                        .setEmoji({ name: "▶️" })
                        .setStyle(index >= pages - 1 ? ButtonStyle.Secondary : ButtonStyle.Primary)
                        .setDisabled(index >= pages - 1),
                    new ButtonBuilder()
                        .setLabel("Last page")
                        .setCustomId("last")
                        .setEmoji({ name: "⏭️" })
                        .setStyle(index > pages - 3 ? ButtonStyle.Secondary : ButtonStyle.Primary)
                        .setDisabled(index > pages - 3)]
                );

            const msg: Message = await ((interaction instanceof CommandInteraction ? interaction.reply({
                embeds: [await embed(data.slice(index * itemsPerPage, index * itemsPerPage + itemsPerPage), index, pages, index * itemsPerPage)],
                components: [getRow()],
                fetchReply: true
            }) : interaction.update({
                embeds: [await embed(data.slice(index * itemsPerPage, index * itemsPerPage + itemsPerPage), index, pages, index * itemsPerPage)],
                components: [getRow()],
                fetchReply: true
            })) as Promise<Message>);

            const updateMessage = async (interaction: MessageComponentInteraction) => {
                interaction.update({
                    embeds: [await embed(data.slice(index * itemsPerPage, index * itemsPerPage + itemsPerPage), index, pages, index * itemsPerPage)],
                    components: [getRow()]
                });
            }

            const authorId = interaction.user.id;
            
            const collector = msg.createMessageComponentCollector({ filter: interaction => interaction.user.id === authorId, idle: 300000 });

            collector.on("collect", interaction => {
                switch (interaction.customId) {
                    case "first":
                        index = 0;
                        updateMessage(interaction);
                        break;
                    case "last":
                        index = pages - 1;
                        updateMessage(interaction);
                        break;
                    case "next":
                        index++;
                        updateMessage(interaction);
                        break;
                    case "previous":
                        index--;
                        updateMessage(interaction);
                        break;
                }
            });

            collector.on("end", async (coll, reason) => {
                if (reason === "idle") {
                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([
                            new ButtonBuilder()
                                .setLabel("First page")
                                .setCustomId("first")
                                .setEmoji({ name: "⏮️" })
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setLabel("Back")
                                .setCustomId("back")
                                .setEmoji({ name: "◀️" })
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setLabel(`Page ${index + 1} out of ${pages}`)
                                .setStyle(ButtonStyle.Secondary)
                                .setCustomId("currentPage")
                                .setEmoji({ name: "📖" })
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setLabel("Next")
                                .setCustomId("previous")
                                .setEmoji({ name: "▶️" })
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setLabel("Last page")
                                .setCustomId("last")
                                .setEmoji({ name: "⏭️" })
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)]
                        );

                        await msg.edit({ components: [row] });
                }

                res();
            });
        } catch (e) {
            rej(e);
        }
    });
}

export function showCustomPages<T>(interaction: CommandInteraction | MessageComponentInteraction, itemsPerPage: number, data: T[], embed: (data: T[], row: ActionRowBuilder<MessageActionRowComponentBuilder> | undefined, page: number, pages: number, start: number) => { embeds?: (JSONEncodable<APIEmbed> | APIEmbed)[], content?: string, components: ( 
    (JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
    | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
    | APIActionRowComponent<APIMessageActionRowComponent>
    )[] | undefined) }, customInteraction: (interaction: MessageComponentInteraction<CacheType>, updateMsg?: (interaction: MessageComponentInteraction) => Promise<void>) => Promise<{ back: boolean; newData?: T[] } | void>, index = 0): Promise<void> {
    return new Promise(async (res, rej) => {
        try {
            if (index < 0) {
                res();
            }

            // if (itemsPerPage >= data.length) {
            //     const row = new MessageActionRow()
            //         .addComponents(
            //             new MessageButton()
            //                 .setLabel(`Page 1 out of 1`)
            //                 .setStyle("SECONDARY")
            //                 .setCustomId("currentPage")
            //                 .setEmoji("📖")
            //                 .setDisabled(true));

            //     await message.channel.send({
            //         reply: { messageReference: message.id },
            //         ...embed(data, row, 0, 1, 0)
            //     });
            //     res();
            //     return;
            // }

            const pages = getPages(itemsPerPage, data.length);

            const getRow = () => new ActionRowBuilder<ButtonBuilder>()
                .addComponents([
                    new ButtonBuilder()
                        .setLabel("First page")
                        .setCustomId("first")
                        .setEmoji({ name: "⏮️" })
                        .setStyle(index < 2 ? ButtonStyle.Secondary : ButtonStyle.Primary)
                        .setDisabled(index < 2),
                    new ButtonBuilder()
                        .setLabel("Previous")
                        .setCustomId("previous")
                        .setEmoji({ name: "◀️" })
                        .setStyle(index < 1 ? ButtonStyle.Secondary : ButtonStyle.Primary)
                        .setDisabled(index < 1),
                    new ButtonBuilder()
                        .setLabel(`Page ${index + 1} out of ${pages}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId("currentPage")
                        .setEmoji({ name: "📖" })
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setLabel("Next")
                        .setCustomId("next")
                        .setEmoji({ name: "▶️" })
                        .setStyle(index >= pages - 1 ? ButtonStyle.Secondary : ButtonStyle.Primary)
                        .setDisabled(index >= pages - 1),
                    new ButtonBuilder()
                        .setLabel("Last page")
                        .setCustomId("last")
                        .setEmoji({ name: "⏭️" })
                        .setStyle(index > pages - 3 ? ButtonStyle.Secondary : ButtonStyle.Primary)
                        .setDisabled(index > pages - 3)]
                );


            const msg: Message = await ( (interaction.isCommand() ? 
            interaction.reply({...embed(data.slice(index * itemsPerPage, index * itemsPerPage + itemsPerPage), pages > 1 ? getRow() : undefined, index, pages, index * itemsPerPage), fetchReply: true }) : 
            interaction.update({...embed(data.slice(index * itemsPerPage, index * itemsPerPage + itemsPerPage), pages > 1 ? getRow() : undefined, index, pages, index * itemsPerPage), fetchReply: true }))) as Message;

            const updateMessage = async (interaction: MessageComponentInteraction) => {
                interaction.update(embed(data.slice(index * itemsPerPage, index * itemsPerPage + itemsPerPage), getRow(), index, pages, index * itemsPerPage));
            }            

            const collector = msg.createMessageComponentCollector({ idle: 300000 });

            collector.on("collect", async compinteraction => {
                if (compinteraction.user.id !== interaction.user.id) {
                    await compinteraction.reply({
                        content: "You may not interact with this menu!",
                        ephemeral: true
                    });
                    return;
                }

                switch (compinteraction.customId) {
                    case "first":
                        index = 0;
                        await updateMessage(compinteraction);
                        break;
                    case "last":
                        index = pages - 1;
                        await updateMessage(compinteraction);
                        break;
                    case "next":
                        index++;
                        await updateMessage(compinteraction);
                        break;
                    case "previous":
                        index--;
                        await updateMessage(compinteraction);
                        break;
                    default:
                        const res = await customInteraction(compinteraction, updateMessage);
                        if(typeof res === "object") {
                            if(res.newData) {
                                data = res.newData;
                            }
                            if(res.back) {
                                await updateMessage(compinteraction);
                            }
                        }
                        break;

                }
            });

            collector.on("end", async (coll, reason) => {
                if (reason === "idle") {
                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([
                            new ButtonBuilder()
                                .setLabel("First page")
                                .setCustomId("first")
                                .setEmoji({ name: "⏮️" })
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setLabel("Back")
                                .setCustomId("back")
                                .setEmoji({ name: "◀️" })
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setLabel(`Page ${index + 1} out of ${pages}`)
                                .setStyle(ButtonStyle.Secondary)
                                .setCustomId("currentPage")
                                .setEmoji({ name: "📖" })
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setLabel("Next")
                                .setCustomId("previous")
                                .setEmoji({ name: "▶️" })
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setLabel("Last page")
                                .setCustomId("last")
                                .setEmoji({ name: "⏭️" })
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)]
                        );

                        await msg.edit({ components: [row] });
                }

                res();
            });
        } catch (e) {
            rej(e);
        }
    });
}

export function getPages(itemsPerPages: number, length: number) {
    return Math.ceil(length / itemsPerPages);
}