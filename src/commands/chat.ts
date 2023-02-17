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
import type {Chat as ChatCompilation} from "../compilations.js";
import type {Chat as ChatDefinition} from "../definitions.js";
import type {Chat as ChatDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {chat as chatCompilation} from "../compilations.js";
import {chat as chatDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = ChatDependency["help"];
const {
	commandName,
	commandDescription,
	postSubCommandName,
	postSubCommandDescription,
	patchSubCommandName,
	patchSubCommandDescription,
	attachSubCommandName,
	attachSubCommandDescription,
	detachSubCommandName,
	detachSubCommandDescription,
	channelOptionName,
	channelOptionDescription,
	messageOptionName,
	messageOptionDescription,
	contentOptionName,
	contentOptionDescription,
	positionOptionName,
	positionOptionDescription,
	attachmentOptionName,
	attachmentOptionDescription,
}: ChatDefinition = chatDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	bareReply: bareReplyLocalizations,
	noPrivacyReply: noPrivacyReplyLocalizations,
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
	noPositionReply: noPositionReplyLocalizations,
	noInteractionReply: noInteractionReplyLocalizations,
	noContentOrAttachmentReply: noContentOrAttachmentReplyLocalizations,
	noPatchPermissionReply: noPatchPermissionReplyLocalizations,
	noPostPermissionReply: noPostPermissionReplyLocalizations,
}: ChatCompilation = chatCompilation;
const messagePattern: RegExp = /^(?:0|[1-9]\d*)$/;
const channels: Set<string> = new Set<string>(["🔧│console", "🔎│logs", "🔰│helpers-room", "🛡│moderators-room"]);
const chatCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
			options: [
				{
					type: "SUB_COMMAND",
					name: postSubCommandName,
					description: postSubCommandDescription["en-US"],
					descriptionLocalizations: postSubCommandDescription,
					options: [
						{
							type: "CHANNEL",
							name: channelOptionName,
							description: channelOptionDescription["en-US"],
							descriptionLocalizations: channelOptionDescription,
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
					description: patchSubCommandDescription["en-US"],
					descriptionLocalizations: patchSubCommandDescription,
					options: [
						{
							type: "CHANNEL",
							name: channelOptionName,
							description: channelOptionDescription["en-US"],
							descriptionLocalizations: channelOptionDescription,
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
							description: messageOptionDescription["en-US"],
							descriptionLocalizations: messageOptionDescription,
							required: true,
						},
					],
				},
				{
					type: "SUB_COMMAND",
					name: attachSubCommandName,
					description: attachSubCommandDescription["en-US"],
					descriptionLocalizations: attachSubCommandDescription,
					options: [
						{
							type: "CHANNEL",
							name: channelOptionName,
							description: channelOptionDescription["en-US"],
							descriptionLocalizations: channelOptionDescription,
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
							description: messageOptionDescription["en-US"],
							descriptionLocalizations: messageOptionDescription,
							required: true,
						},
						{
							type: "INTEGER",
							name: positionOptionName,
							description: positionOptionDescription["en-US"],
							descriptionLocalizations: positionOptionDescription,
							required: true,
							minValue: 0,
						},
						{
							type: "ATTACHMENT",
							name: attachmentOptionName,
							description: attachmentOptionDescription["en-US"],
							descriptionLocalizations: attachmentOptionDescription,
							required: true,
						},
					],
				},
				{
					type: "SUB_COMMAND",
					name: detachSubCommandName,
					description: detachSubCommandDescription["en-US"],
					descriptionLocalizations: detachSubCommandDescription,
					options: [
						{
							type: "CHANNEL",
							name: channelOptionName,
							description: channelOptionDescription["en-US"],
							descriptionLocalizations: channelOptionDescription,
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
							description: messageOptionDescription["en-US"],
							descriptionLocalizations: messageOptionDescription,
							required: true,
						},
						{
							type: "INTEGER",
							name: positionOptionName,
							description: positionOptionDescription["en-US"],
							descriptionLocalizations: positionOptionDescription,
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
				title: contentOptionDescription[resolvedLocale],
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
				title: contentOptionDescription[resolvedLocale],
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
					return channelOptionDescription[locale];
				},
				messageOptionDescription: (): string => {
					return messageOptionDescription[locale];
				},
				contentOptionDescription: (): string => {
					return contentOptionDescription[locale];
				},
				positionOptionDescription: (): string => {
					return positionOptionDescription[locale];
				},
				attachmentOptionDescription: (): string => {
					return attachmentOptionDescription[locale];
				},
			};
		}));
	},
};
export default chatCommand;
