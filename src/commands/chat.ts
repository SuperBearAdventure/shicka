import type {
	ApplicationCommandData,
	CommandInteraction,
	// FileOptions,
	Interaction,
	Message,
	// MessageAttachment,
	ThreadChannel,
} from "discord.js";
import type Command from "../commands.js";
import type {Locale, Localized} from "../utils/string.js";
import {compileAll, composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
	channelOptionDescription: () => string,
	contentOptionDescription: () => string,
	messageOptionDescription: () => string,
};
type ReplyGroups = {};
type BareReplyGroups = {};
type NoPrivacyReplyGroups = {};
type NoChannelReplyGroups = {};
type NoMessageReplyGroups = {};
// type NoContentOrAttachmentReplyGroups = {};
type NoInteractionReplyGroups = {};
type NoEditPermissionReplyGroups = {};
type NoPostPermissionReplyGroups = {};
const commandName: string = "chat";
// const commandDescriptionLocalizations: Localized<string> = {
// 	"en-US": "Posts this content with these attachments or edits this message with them in this channel",
// 	"fr": "Publie ce contenu avec ces pièces jointes ou modifie ce message avec ceux-là dans ce salon",
// };
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Posts this content or edits this message with it in this channel",
	"fr": "Envoie ce contenu ou modifie ce message avec celui-là dans ce salon",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const messageOptionName: string = "message";
const messageOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some message",
	"fr": "Un message",
};
const messageOptionDescription: string = messageOptionDescriptionLocalizations["en-US"];
const channelOptionName: string = "channel";
const channelOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some channel",
	"fr": "Un salon",
};
const channelOptionDescription: string = channelOptionDescriptionLocalizations["en-US"];
const contentOptionName: string = "content";
const contentOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some content",
	"fr": "Un contenu",
};
const contentOptionDescription: string = contentOptionDescriptionLocalizations["en-US"];
const messagePattern: RegExp = /^(?:0|[1-9]\d*)$/;
const channels: Set<string> = new Set<string>(["🔧│console", "🔎│logs", "🔰│helpers-room", "🛡│moderators-room"]);
// const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
// 	"en-US": "Type `/$<commandName> $<channelOptionDescription>` to post some attachments in `$<channelOptionDescription>`\nType `/$<commandName> $<channelOptionDescription> $<contentOptionDescription>` to post `$<contentOptionDescription>` and some attachments in `$<channelOptionDescription>`\nType `/$<commandName> $<channelOptionDescription> $<messageOptionDescription>` to edit `$<messageOptionDescription>` with some attachments in `$<channelOptionDescription>`\nType `/$<commandName> $<channelOptionDescription> $<messageOptionDescription> $<contentOptionDescription>` to edit `$<messageOptionDescription>` with `$<contentOptionDescription>` and some attachments in `$<channelOptionDescription>`",
// 	"fr": "Tape `/$<commandName> $<channelOptionDescription>` pour envoyer des pièces jointes dans `$<channelOptionDescription>`\nTape `/$<commandName> $<channelOptionDescription> $<contentOptionDescription>` pour envoyer `$<contentOptionDescription>` et des pièces jointes dans `$<channelOptionDescription>`\nTape `/$<commandName> $<channelOptionDescription> $<messageOptionDescription>` pour modifier `$<messageOptionDescription>` avec des pièces jointes dans `$<channelOptionDescription>`\nTape `/$<commandName> $<channelOptionDescription> $<messageOptionDescription> $<contentOptionDescription>` pour modifier `$<messageOptionDescription>` avec `$<contentOptionDescription>` et des pièces jointes dans `$<channelOptionDescription>`",
// });
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName> $<channelOptionDescription> $<contentOptionDescription>` to send `$<contentOptionDescription>` in `$<channelOptionDescription>`\nType `/$<commandName> $<channelOptionDescription> $<contentOptionDescription> $<messageOptionDescription>` to edit `$<messageOptionDescription>` with `$<contentOptionDescription>` in `$<channelOptionDescription>`",
	"fr": "Tape `/$<commandName> $<channelOptionDescription> $<contentOptionDescription>` pour envoyer `$<contentOptionDescription>` dans `$<channelOptionDescription>`\nTape `/$<commandName> $<channelOptionDescription> $<contentOptionDescription> $<messageOptionDescription>` pour modifier `$<messageOptionDescription>` avec `$<contentOptionDescription>` dans `$<channelOptionDescription>`",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "I have edited the message.",
	"fr": "J'ai modifié le message.",
});
const bareReplyLocalizations: Localized<(groups: BareReplyGroups) => string> = compileAll<BareReplyGroups>({
	"en-US": "I have posted the message.",
	"fr": "J'ai envoyé le message.",
});
const noPrivacyReplyLocalizations: Localized<(groups: NoPrivacyReplyGroups) => string> = compileAll<NoPrivacyReplyGroups>({
	"en-US": "I can not reply to you in this channel.\nPlease ask me in a private channel instead.",
	"fr": "Je ne peux pas te répondre dans ce salon.\nMerci de me demander dans un salon privé à la place.",
});
const noChannelReplyLocalizations: Localized<(groups: NoChannelReplyGroups) => string> = compileAll<NoChannelReplyGroups>({
	"en-US": "I do not know any channel with this tag.",
	"fr": "Je ne connais aucun salon avec cette étiquette.",
});
const noMessageReplyLocalizations: Localized<(groups: NoMessageReplyGroups) => string> = compileAll<NoMessageReplyGroups>({
	"en-US": "I do not know any message with this identifier in this channel.",
	"fr": "Je ne connais aucun message avec cet identifiant dans ce salon.",
});
const noInteractionReplyLocalizations: Localized<(groups: NoInteractionReplyGroups) => string> = compileAll<NoInteractionReplyGroups>({
	"en-US": "I can not edit interaction replies or follow-ups.",
	"fr": "Je ne peux pas modifier de réponses ou de suites aux interactions.",
});
// const noContentOrAttachmentReplyLocalizations: Localized<(groups: NoContentOrAttachmentReplyGroups) => string> = compileAll<NoContentOrAttachmentReplyGroups>({
// 	"en-US": "Please give me a content or attachments.",
// 	"fr": "Merci de me donner un contenu ou des pièces jointes.",
// });
const noEditPermissionReplyLocalizations: Localized<(groups: NoEditPermissionReplyGroups) => string> = compileAll<NoEditPermissionReplyGroups>({
	"en-US": "I do not have the rights to edit this message.",
	"fr": "Je n'ai pas les droits pour modifier ce message.",
});
const noPostPermissionReplyLocalizations: Localized<(groups: NoPostPermissionReplyGroups) => string> = compileAll<NoPostPermissionReplyGroups>({
	"en-US": "I do not have the rights to post this message.",
	"fr": "Je n'ai pas les droits pour envoyer ce message.",
});
const chatCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
			options: [
				{
					type: "CHANNEL",
					name: channelOptionName,
					description: channelOptionDescription,
					descriptionLocalizations: channelOptionDescriptionLocalizations,
					required: true,
					channelTypes: [
						"GUILD_TEXT",
						"GUILD_VOICE",
						"GUILD_NEWS",
						"GUILD_NEWS_THREAD",
						"GUILD_PUBLIC_THREAD",
						"GUILD_PRIVATE_THREAD",
					],
				},
				{
					type: "STRING",
					name: contentOptionName,
					description: contentOptionDescription,
					descriptionLocalizations: contentOptionDescriptionLocalizations,
					required: true,
				},
				{
					type: "STRING",
					name: messageOptionName,
					description: messageOptionDescription,
					descriptionLocalizations: messageOptionDescriptionLocalizations,
				},
				// {
				// 	type: "STRING",
				// 	name: contentOptionName,
				// 	description: contentOptionDescription,
				// 	descriptionLocalizations: contentOptionDescriptionLocalizations,
				// },
			],
			defaultPermission: false,
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {channel, locale, options}: CommandInteraction = interaction;
		const resolvedLocale: Locale = resolve(locale);
		if (channel == null || !("name" in channel)) {
			await interaction.reply({
				content: noPrivacyReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		if (!channel.isThread() && !channels.has(channel.name)) {
			await interaction.reply({
				content: noPrivacyReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		if (channel.isThread()) {
			const {parent}: ThreadChannel = channel;
			if (parent == null || !channels.has(parent.name)) {
				await interaction.reply({
					content: noPrivacyReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
		}
		const targetChannel: any = options.getChannel(channelOptionName, true);
		if (!("messages" in targetChannel)) {
			await interaction.reply({
				content: noChannelReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		const identifier: string | null = options.getString(messageOptionName);
		if (identifier != null) {
			const messageMatches: RegExpMatchArray | null = identifier.match(messagePattern);
			if (messageMatches == null) {
				await interaction.reply({
					content: noMessageReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			const targetMessage: Message | undefined = await (async (): Promise<Message | undefined> => {
				try {
					return await targetChannel.messages.fetch(identifier);
				} catch {}
			})();
			if (targetMessage == null) {
				await interaction.reply({
					content: noMessageReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			if (targetMessage.interaction != null) {
				await interaction.reply({
					content: noInteractionReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			const content: string = options.getString(contentOptionName, true);
			// if (content == null && interaction.attachments.size === 0) {
			// 	await interaction.reply({
			// 		content: noContentOrAttachmentsReplyLocalizations[resolvedLocale]({}),
			// 		ephemeral: true,
			// 	});
			// 	return;
			// }
			// const files: FileOptions[] | null = interaction.attachments.map((attachment: MessageAttachment): FileOptions => {
			// 	const {name, url}: MessageAttachment = attachment;
			// 	return {
			// 		attachment: url,
			// 		name: name ?? "",
			// 	};
			// });
			// const attachments: MessageAttachment[] = [];
			try {
				// await targetMessage.edit({content, files, attachments});
				await targetMessage.edit({content});
			} catch {
				await interaction.reply({
					content: noEditPermissionReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			await interaction.reply({
				content: replyLocalizations["en-US"]({}),
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await interaction.followUp({
				content: replyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		const content: string = options.getString(contentOptionName, true);
		// if (content == null && interaction.attachments.size === 0) {
		// 	await interaction.reply({
		// 		content: noContentOrAttachmentsReplyLocalizations[resolvedLocale]({}),
		// 		ephemeral: true,
		// 	});
		// 	return;
		// }
		// const files: FileOptions[] = interaction.attachments.map((attachment: MessageAttachment): FileOptions => {
		// 	const {name, url}: MessageAttachment = attachment;
		// 	return {
		// 		attachment: url,
		// 		name: name ?? "",
		// 	};
		// });
		try {
			// await targetChannel.send({content, files});
			await targetChannel.send({content});
		} catch {
			await interaction.reply({
				content: noPostPermissionReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		await interaction.reply({
			content: bareReplyLocalizations["en-US"]({}),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: bareReplyLocalizations[resolvedLocale]({}),
			ephemeral: true,
		});
	},
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
		const {channel}: CommandInteraction = interaction;
		if (channel == null || !("name" in channel) || !channels.has(channel.name)) {
			return null;
		}
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
				channelOptionDescription: (): string => {
					return channelOptionDescriptionLocalizations[locale];
				},
				contentOptionDescription: (): string => {
					return contentOptionDescriptionLocalizations[locale];
				},
				messageOptionDescription: (): string => {
					return messageOptionDescriptionLocalizations[locale];
				},
			};
		}));
	},
};
export default chatCommand;
