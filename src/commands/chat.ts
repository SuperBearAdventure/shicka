import type {
	ApplicationCommandData,
	CommandInteraction,
	FileOptions,
	Interaction,
	Message,
	MessageAttachment,
	ModalSubmitInteraction,
	ThreadChannel,
} from "discord.js";
import type Command from "../commands.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {compileAll, composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
	postSubCommandName: () => string,
	patchSubCommandName: () => string,
	attachSubCommandName: () => string,
	detachSubCommandName: () => string,
	channelOptionDescription: () => string,
	messageOptionDescription: () => string,
	contentOptionDescription: () => string,
	positionOptionDescription: () => string,
	attachmentOptionDescription: () => string,
};
type ReplyGroups = {};
type BareReplyGroups = {};
type NoPrivacyReplyGroups = {};
type NoChannelReplyGroups = {};
type NoMessageReplyGroups = {};
type NoPositionReplyGroups = {
	max: () => string,
};
type NoContentOrAttachmentReplyGroups = {};
type NoInteractionReplyGroups = {};
type NoPatchPermissionReplyGroups = {};
type NoPostPermissionReplyGroups = {};
const commandName: string = "chat";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Sends this content with these attachments or edits this message with them in this channel",
	"fr": "Envoie ce contenu avec ces pièces jointes ou modifie ce message avec ceux-là dans ce salon",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const postSubCommandName: string = "post";
const postSubCommandDescriptionLocalizations: Localized<string> = {
	"en-US": "Sends this content in this channel",
	"fr": "Envoie ce contenu dans ce salon",
};
const postSubCommandDescription: string = postSubCommandDescriptionLocalizations["en-US"];
const patchSubCommandName: string = "patch";
const patchSubCommandDescriptionLocalizations: Localized<string> = {
	"en-US": "Edits this message with this content in this channel",
	"fr": "Modifie de message avec ce contenu dans ce salon",
};
const patchSubCommandDescription: string = patchSubCommandDescriptionLocalizations["en-US"];
const attachSubCommandName: string = "attach";
const attachSubCommandDescriptionLocalizations: Localized<string> = {
	"en-US": "Adds at this position this attachment to this message in this channel",
	"fr": "Ajoute à cette position cette pièce jointe à ce message dans ce salon",
};
const attachSubCommandDescription: string = attachSubCommandDescriptionLocalizations["en-US"];
const detachSubCommandName: string = "detach";
const detachSubCommandDescriptionLocalizations: Localized<string> = {
	"en-US": "Removes at this position the attachment from this message in this channel",
	"fr": "Retire à cette position la pièce jointe de ce message dans ce salon",
};
const detachSubCommandDescription: string = detachSubCommandDescriptionLocalizations["en-US"];
const channelOptionName: string = "channel";
const channelOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some channel",
	"fr": "Un salon",
};
const channelOptionDescription: string = channelOptionDescriptionLocalizations["en-US"];
const messageOptionName: string = "message";
const messageOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some message",
	"fr": "Un message",
};
const messageOptionDescription: string = messageOptionDescriptionLocalizations["en-US"];
const contentOptionName: string = "content";
const contentOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some content",
	"fr": "Un contenu",
};
// const contentOptionDescription: string = contentOptionDescriptionLocalizations["en-US"];
const positionOptionName: string = "position";
const positionOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some position",
	"fr": "Une position",
};
const positionOptionDescription: string = messageOptionDescriptionLocalizations["en-US"];
const attachmentOptionName: string = "attachment";
const attachmentOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some attachment",
	"fr": "Une pièce jointe",
};
const attachmentOptionDescription: string = messageOptionDescriptionLocalizations["en-US"];
const messagePattern: RegExp = /^(?:0|[1-9]\d*)$/;
const channels: Set<string> = new Set<string>(["🔧│console", "🔎│logs", "🔰│helpers-room", "🛡│moderators-room"]);
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName> $<postSubCommandName> $<channelOptionDescription> $<contentOptionDescription>` to send `$<contentOptionDescription>` in `$<channelOptionDescription>`\nType `/$<commandName> $<patchSubCommandName> $<channelOptionDescription> $<messageOptionDescription> $<contentOptionDescription>` to edit `$<messageOptionDescription>` with `$<contentOptionDescription>` in `$<channelOptionDescription>`\nType `/$<commandName> $<attachSubCommandName> $<channelOptionDescription> $<messageOptionDescription> $<positionOptionDescription> $<attachmentOptionDescription>` to add at `$<positionOptionDescription>` `$<attachmentOptionDescription>` to `$<messageOptionDescription>` in `$<channelOptionDescription>`\nType `/$<commandName> $<detachSubCommandName> $<channelOptionDescription> $<messageOptionDescription> $<positionOptionDescription>` to remove at `$<positionOptionDescription>` the attachment of `$<messageOptionDescription>` in `$<channelOptionDescription>`",
	"fr": "Tape `/$<commandName> $<postSubCommandName> $<channelOptionDescription> $<contentOptionDescription>` pour envoyer `$<contentOptionDescription>` dans `$<channelOptionDescription>`\nTape `/$<commandName> $<patchSubCommandName> $<channelOptionDescription> $<messageOptionDescription>` $<contentOptionDescription> pour modifier `$<messageOptionDescription>` avec `$<contentOptionDescription>` dans `$<channelOptionDescription>`\nTape `/$<commandName> $<attachSubCommandName> $<channelOptionDescription> $<messageOptionDescription> $<positionOptionDescription> $<attachmentOptionDescription>` pour ajouter à `$<positionOptionDescription>` `$<attachmentOptionDescription>` à `$<messageOptionDescription>` dans `$<channelOptionDescription>`\nTape `/$<commandName> $<detachSubCommandName> $<channelOptionDescription> $<messageOptionDescription> $<positionOptionDescription>` pour retirer à `$<positionOptionDescription>` la pièce jointe de `$<messageOptionDescription>` dans `$<channelOptionDescription>`",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "I have edited the message.",
	"fr": "J'ai modifié le message.",
});
const bareReplyLocalizations: Localized<(groups: BareReplyGroups) => string> = compileAll<BareReplyGroups>({
	"en-US": "I have sent the message.",
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
const noPositionReplyLocalizations: Localized<(groups: NoPositionReplyGroups) => string> = compileAll<NoPositionReplyGroups>({
	"en-US": "I do not know any slot with this position.\nPlease give me a position between `0` and `$<max>` instead.",
	"fr": "Je ne connais aucun emplacement avec cette position.\nMerci de me donner une position entre `0` et `$<max>` à la place.",
});
const noInteractionReplyLocalizations: Localized<(groups: NoInteractionReplyGroups) => string> = compileAll<NoInteractionReplyGroups>({
	"en-US": "I can not edit interaction replies or follow-ups.",
	"fr": "Je ne peux pas modifier de réponses ou de suites aux interactions.",
});
const noContentOrAttachmentReplyLocalizations: Localized<(groups: NoContentOrAttachmentReplyGroups) => string> = compileAll<NoContentOrAttachmentReplyGroups>({
	"en-US": "Please keep a content or attachments.",
	"fr": "Merci de garder un contenu ou des pièces jointes.",
});
const noPatchPermissionReplyLocalizations: Localized<(groups: NoPatchPermissionReplyGroups) => string> = compileAll<NoPatchPermissionReplyGroups>({
	"en-US": "I do not have the rights to edit this message.",
	"fr": "Je n'ai pas les droits pour modifier ce message.",
});
const noPostPermissionReplyLocalizations: Localized<(groups: NoPostPermissionReplyGroups) => string> = compileAll<NoPostPermissionReplyGroups>({
	"en-US": "I do not have the rights to send this message.",
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
					type: "SUB_COMMAND",
					name: postSubCommandName,
					description: postSubCommandDescription,
					descriptionLocalizations: postSubCommandDescriptionLocalizations,
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
					],
				},
				{
					type: "SUB_COMMAND",
					name: patchSubCommandName,
					description: patchSubCommandDescription,
					descriptionLocalizations: patchSubCommandDescriptionLocalizations,
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
							name: messageOptionName,
							description: messageOptionDescription,
							descriptionLocalizations: messageOptionDescriptionLocalizations,
							required: true,
						},
					],
				},
				{
					type: "SUB_COMMAND",
					name: attachSubCommandName,
					description: attachSubCommandDescription,
					descriptionLocalizations: attachSubCommandDescriptionLocalizations,
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
							name: messageOptionName,
							description: messageOptionDescription,
							descriptionLocalizations: messageOptionDescriptionLocalizations,
							required: true,
						},
						{
							type: "INTEGER",
							name: positionOptionName,
							description: positionOptionDescription,
							descriptionLocalizations: positionOptionDescriptionLocalizations,
							required: true,
							minValue: 0,
						},
						{
							type: "ATTACHMENT",
							name: attachmentOptionName,
							description: attachmentOptionDescription,
							descriptionLocalizations: attachmentOptionDescriptionLocalizations,
							required: true,
						},
					],
				},
				{
					type: "SUB_COMMAND",
					name: detachSubCommandName,
					description: detachSubCommandDescription,
					descriptionLocalizations: detachSubCommandDescriptionLocalizations,
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
							name: messageOptionName,
							description: messageOptionDescription,
							descriptionLocalizations: messageOptionDescriptionLocalizations,
							required: true,
						},
						{
							type: "INTEGER",
							name: positionOptionName,
							description: positionOptionDescription,
							descriptionLocalizations: positionOptionDescriptionLocalizations,
							required: true,
							minValue: 0,
						},
					],
				},
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
		const subCommandName: string = options.getSubcommand(true);
		const targetChannel: any = options.getChannel(channelOptionName, true);
		if (!("messages" in targetChannel)) {
			await interaction.reply({
				content: noChannelReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		if (subCommandName === patchSubCommandName) {
			const identifier: string = options.getString(messageOptionName, true);
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
			await interaction.showModal({
				customId: interaction.id,
				title: contentOptionDescriptionLocalizations[resolvedLocale],
				components: [
					{
						type: "ACTION_ROW",
						components: [
							{
								type: "TEXT_INPUT",
								style: "PARAGRAPH",
								customId: contentOptionName,
								label: contentOptionName,
								value: targetMessage.content,
								minLength: 0,
								maxLength: 2000,
							},
						],
					},
				],
			});
			const modalSubmitInteraction: ModalSubmitInteraction = await interaction.awaitModalSubmit({
				filter: (modalSubmitInteraction: ModalSubmitInteraction): boolean => {
					return modalSubmitInteraction.customId === interaction.id;
				},
				time: 900000,
			});
			const content: string | null = modalSubmitInteraction.fields.getTextInputValue(contentOptionName) || null;
			if (content == null && targetMessage.attachments.size === 0) {
				await modalSubmitInteraction.reply({
					content: noContentOrAttachmentReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			try {
				await targetMessage.edit({content});
			} catch {
				await modalSubmitInteraction.reply({
					content: noPatchPermissionReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			await modalSubmitInteraction.reply({
				content: replyLocalizations["en-US"]({}),
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await modalSubmitInteraction.followUp({
				content: replyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		if (subCommandName === postSubCommandName) {
			await interaction.showModal({
				customId: interaction.id,
				title: contentOptionDescriptionLocalizations[resolvedLocale],
				components: [
					{
						type: "ACTION_ROW",
						components: [
							{
								type: "TEXT_INPUT",
								style: "PARAGRAPH",
								customId: contentOptionName,
								label: contentOptionName,
								required: true,
								value: "",
								minLength: 0,
								maxLength: 2000,
							},
						],
					},
				],
			});
			const modalSubmitInteraction: ModalSubmitInteraction = await interaction.awaitModalSubmit({
				filter: (modalSubmitInteraction: ModalSubmitInteraction): boolean => {
					return modalSubmitInteraction.customId === interaction.id;
				},
				time: 900000,
			});
			const content: string = modalSubmitInteraction.fields.getTextInputValue(contentOptionName);
			try {
				await targetChannel.send({content});
			} catch {
				await modalSubmitInteraction.reply({
					content: noPostPermissionReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			await modalSubmitInteraction.reply({
				content: bareReplyLocalizations["en-US"]({}),
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await modalSubmitInteraction.followUp({
				content: bareReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		const identifier: string = options.getString(messageOptionName, true);
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
		if (subCommandName === detachSubCommandName) {
			const targetContent: string = targetMessage.content;
			const targetAttachments: MessageAttachment[] = [...targetMessage.attachments.values()];
			const position: number = options.getInteger(positionOptionName, true);
			if (position < 0 || position >= targetAttachments.length) {
				const max: number = targetAttachments.length - 1;
				await interaction.reply({
					content: noPositionReplyLocalizations[resolvedLocale]({
						max: (): string => {
							return Util.escapeMarkdown(`${max}`);
						},
					}),
					ephemeral: true,
				});
				return;
			}
			if (targetContent === "" && targetAttachments.length === 1) {
				await interaction.reply({
					content: noContentOrAttachmentReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			const content: string = targetContent;
			const files: FileOptions[] = [...targetAttachments.slice(0, position), ...targetAttachments.slice(position + 1)].map<FileOptions>((attachment: MessageAttachment): FileOptions => {
				const {name, url}: MessageAttachment = attachment;
				return {
					attachment: url,
					name: name ?? "",
				};
			});
			const attachments: MessageAttachment[] = [];
			try {
				await targetMessage.edit({content, files, attachments});
			} catch {
				await interaction.reply({
					content: noPatchPermissionReplyLocalizations[resolvedLocale]({}),
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
		if (subCommandName === attachSubCommandName) {
			const targetContent: string = targetMessage.content;
			const targetAttachments: MessageAttachment[] = [...targetMessage.attachments.values()];
			const position: number = options.getInteger(positionOptionName, true);
			if (position < 0 || position >= targetAttachments.length + 1) {
				const max: number = targetAttachments.length;
				await interaction.reply({
					content: noPositionReplyLocalizations[resolvedLocale]({
						max: (): string => {
							return Util.escapeMarkdown(`${max}`);
						},
					}),
					ephemeral: true,
				});
				return;
			}
			const attachment: MessageAttachment = options.getAttachment(attachmentOptionName, true);
			const content: string = targetContent;
			const files: FileOptions[] = [...targetAttachments.slice(0, position), attachment, ...targetAttachments.slice(position)].map<FileOptions>((attachment: MessageAttachment): FileOptions => {
				const {name, url}: MessageAttachment = attachment;
				return {
					attachment: url,
					name: name ?? "",
				};
			});
			const attachments: MessageAttachment[] = [];
			try {
				await targetMessage.edit({content, files, attachments});
			} catch {
				await interaction.reply({
					content: noPatchPermissionReplyLocalizations[resolvedLocale]({}),
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
		return;
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
				postSubCommandName: (): string => {
					return postSubCommandName;
				},
				patchSubCommandName: (): string => {
					return patchSubCommandName;
				},
				attachSubCommandName: (): string => {
					return attachSubCommandName;
				},
				detachSubCommandName: (): string => {
					return detachSubCommandName;
				},
				channelOptionDescription: (): string => {
					return channelOptionDescriptionLocalizations[locale];
				},
				messageOptionDescription: (): string => {
					return messageOptionDescriptionLocalizations[locale];
				},
				contentOptionDescription: (): string => {
					return contentOptionDescriptionLocalizations[locale];
				},
				positionOptionDescription: (): string => {
					return positionOptionDescriptionLocalizations[locale];
				},
				attachmentOptionDescription: (): string => {
					return attachmentOptionDescriptionLocalizations[locale];
				},
			};
		}));
	},
};
export default chatCommand;
