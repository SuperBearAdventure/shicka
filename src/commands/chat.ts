import type {
	Attachment,
	ChatInputCommandInteraction,
	GuildBasedChannel,
	Message,
	ModalSubmitInteraction,
	ThreadChannel,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Chat as ChatCompilation} from "../compilations.js";
import type {Chat as ChatDefinition} from "../definitions.js";
import type {Chat as ChatDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChannelType,
	ComponentType,
	TextInputStyle,
	escapeMarkdown,
} from "discord.js";
import {patch as patchCommand} from "../commands.js";
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
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
	noPositionReply: noPositionReplyLocalizations,
	noInteractionReply: noInteractionReplyLocalizations,
	noContentOrAttachmentReply: noContentOrAttachmentReplyLocalizations,
	noPatchPermissionReply: noPatchPermissionReplyLocalizations,
	noPostPermissionReply: noPostPermissionReplyLocalizations,
}: ChatCompilation = chatCompilation;
const messagePattern: RegExp = /^(?:0|[1-9]\d*)$/;
const chatCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: postSubCommandName,
					description: postSubCommandDescription["en-US"],
					descriptionLocalizations: postSubCommandDescription,
					options: [
						{
							type: ApplicationCommandOptionType.Channel,
							name: channelOptionName,
							description: channelOptionDescription["en-US"],
							descriptionLocalizations: channelOptionDescription,
							required: true,
							channelTypes: [
								ChannelType.GuildText,
								ChannelType.GuildVoice,
								ChannelType.GuildAnnouncement,
								ChannelType.AnnouncementThread,
								ChannelType.PublicThread,
								ChannelType.PrivateThread,
								ChannelType.GuildStageVoice,
								ChannelType.GuildForum,
								ChannelType.GuildMedia,
							],
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: patchSubCommandName,
					description: patchSubCommandDescription["en-US"],
					descriptionLocalizations: patchSubCommandDescription,
					options: [
						{
							type: ApplicationCommandOptionType.Channel,
							name: channelOptionName,
							description: channelOptionDescription["en-US"],
							descriptionLocalizations: channelOptionDescription,
							required: true,
							channelTypes: [
								ChannelType.GuildText,
								ChannelType.GuildVoice,
								ChannelType.GuildAnnouncement,
								ChannelType.AnnouncementThread,
								ChannelType.PublicThread,
								ChannelType.PrivateThread,
								ChannelType.GuildStageVoice,
								ChannelType.GuildForum,
								ChannelType.GuildMedia,
							],
						},
						{
							type: ApplicationCommandOptionType.String,
							name: messageOptionName,
							description: messageOptionDescription["en-US"],
							descriptionLocalizations: messageOptionDescription,
							required: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: attachSubCommandName,
					description: attachSubCommandDescription["en-US"],
					descriptionLocalizations: attachSubCommandDescription,
					options: [
						{
							type: ApplicationCommandOptionType.Channel,
							name: channelOptionName,
							description: channelOptionDescription["en-US"],
							descriptionLocalizations: channelOptionDescription,
							required: true,
							channelTypes: [
								ChannelType.GuildText,
								ChannelType.GuildVoice,
								ChannelType.GuildAnnouncement,
								ChannelType.AnnouncementThread,
								ChannelType.PublicThread,
								ChannelType.PrivateThread,
								ChannelType.GuildStageVoice,
								ChannelType.GuildForum,
								ChannelType.GuildMedia,
							],
						},
						{
							type: ApplicationCommandOptionType.String,
							name: messageOptionName,
							description: messageOptionDescription["en-US"],
							descriptionLocalizations: messageOptionDescription,
							required: true,
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: positionOptionName,
							description: positionOptionDescription["en-US"],
							descriptionLocalizations: positionOptionDescription,
							required: true,
							minValue: 0,
						},
						{
							type: ApplicationCommandOptionType.Attachment,
							name: attachmentOptionName,
							description: attachmentOptionDescription["en-US"],
							descriptionLocalizations: attachmentOptionDescription,
							required: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: detachSubCommandName,
					description: detachSubCommandDescription["en-US"],
					descriptionLocalizations: detachSubCommandDescription,
					options: [
						{
							type: ApplicationCommandOptionType.Channel,
							name: channelOptionName,
							description: channelOptionDescription["en-US"],
							descriptionLocalizations: channelOptionDescription,
							required: true,
							channelTypes: [
								ChannelType.GuildText,
								ChannelType.GuildVoice,
								ChannelType.GuildAnnouncement,
								ChannelType.AnnouncementThread,
								ChannelType.PublicThread,
								ChannelType.PrivateThread,
								ChannelType.GuildStageVoice,
								ChannelType.GuildForum,
								ChannelType.GuildMedia,
							],
						},
						{
							type: ApplicationCommandOptionType.String,
							name: messageOptionName,
							description: messageOptionDescription["en-US"],
							descriptionLocalizations: messageOptionDescription,
							required: true,
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: positionOptionName,
							description: positionOptionDescription["en-US"],
							descriptionLocalizations: positionOptionDescription,
							required: true,
							minValue: 0,
						},
					],
				},
			],
			defaultMemberPermissions: [],
			dmPermission: false,
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {locale, options}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const subCommandName: string = options.getSubcommand(true);
		const channel: GuildBasedChannel = options.getChannel(channelOptionName, true, [
			ChannelType.GuildText,
			ChannelType.GuildVoice,
			ChannelType.GuildAnnouncement,
			ChannelType.AnnouncementThread,
			ChannelType.PublicThread,
			ChannelType.PrivateThread,
			ChannelType.GuildStageVoice,
			ChannelType.GuildForum,
			ChannelType.GuildMedia,
		]);
		if (channel == null) {
			await interaction.reply({
				content: noChannelReplyLocalizations[resolvedLocale]({}),
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
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.TextInput,
								style: TextInputStyle.Paragraph,
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
			const modalSubmitInteraction: ModalSubmitInteraction<"cached"> = await interaction.awaitModalSubmit({
				filter: (modalSubmitInteraction: ModalSubmitInteraction): boolean => {
					return modalSubmitInteraction.customId === interaction.id;
				},
				time: 900000,
			});
			const content: string = modalSubmitInteraction.fields.getTextInputValue(contentOptionName);
			try {
				if (channel.isThreadOnly()) {
					const name: string = "New post";
					await channel.threads.create({
						name,
						message: {content},
					});
				} else {
					await channel.send({content});
				}
			} catch {
				await modalSubmitInteraction.reply({
					content: noPostPermissionReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			function formatMessage(locale: Locale): string {
				return bareReplyLocalizations[locale]({});
			}
			await modalSubmitInteraction.reply({
				content: formatMessage("en-US"),
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await modalSubmitInteraction.followUp({
				content: formatMessage(resolvedLocale),
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
		if (channel.isThread() && channel.id === identifier) {
			await interaction.reply({
				content: noMessageReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		const message: Message<true> | undefined = await (async (): Promise<Message<true> | undefined> => {
			try {
				if (channel.isThreadOnly()) {
					const thread: ThreadChannel<boolean> | undefined = channel.threads.cache.get(identifier);
					if (thread == null) {
						return;
					}
					return await thread.messages.fetch(identifier);
				}
				return await channel.messages.fetch(identifier);
			} catch {}
		})();
		if (message == null) {
			await interaction.reply({
				content: noMessageReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		if (message.interaction != null) {
			await interaction.reply({
				content: noInteractionReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		if (subCommandName === patchSubCommandName) {
			await patchCommand.interact(Object.assign(Object.create(interaction), {
				commandType: ApplicationCommandType.Message,
				get targetMessage(): Message<true> {
					return message;
				},
			}));
			return;
		}
		if (subCommandName === attachSubCommandName) {
			const content: string = message.content;
			const attachments: Attachment[] = [...message.attachments.values()];
			const position: number = options.getInteger(positionOptionName, true);
			if (position < 0 || position >= attachments.length + 1) {
				const max: number = attachments.length;
				await interaction.reply({
					content: noPositionReplyLocalizations[resolvedLocale]({
						max: escapeMarkdown(`${max}`),
					}),
					ephemeral: true,
				});
				return;
			}
			const attachment: Attachment = options.getAttachment(attachmentOptionName, true);
			const files: Attachment[] = [...attachments.slice(0, position), attachment, ...attachments.slice(position)];
			try {
				await message.edit({content, files});
			} catch {
				await interaction.reply({
					content: noPatchPermissionReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			function formatMessage(locale: Locale): string {
				return replyLocalizations[locale]({});
			}
			await interaction.reply({
				content: formatMessage("en-US"),
				ephemeral: true,
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await interaction.followUp({
				content: formatMessage(resolvedLocale),
				ephemeral: true,
			});
			return;
		}
		if (subCommandName === detachSubCommandName) {
			const content: string = message.content;
			const attachments: Attachment[] = [...message.attachments.values()];
			const position: number = options.getInteger(positionOptionName, true);
			if (position < 0 || position >= attachments.length) {
				const max: number = attachments.length - 1;
				await interaction.reply({
					content: noPositionReplyLocalizations[resolvedLocale]({
						max: escapeMarkdown(`${max}`),
					}),
					ephemeral: true,
				});
				return;
			}
			if (content === "" && attachments.length === 1) {
				await interaction.reply({
					content: noContentOrAttachmentReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			const files: Attachment[] = [...attachments.slice(0, position), ...attachments.slice(position + 1)];
			try {
				await message.edit({content, files});
			} catch {
				await interaction.reply({
					content: noPatchPermissionReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			function formatMessage(locale: Locale): string {
				return replyLocalizations[locale]({});
			}
			await interaction.reply({
				content: formatMessage("en-US"),
				ephemeral: true,
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await interaction.followUp({
				content: formatMessage(resolvedLocale),
				ephemeral: true,
			});
			return;
		}
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				postSubCommandMention: `</${commandName} ${postSubCommandName}:${applicationCommand.id}>`,
				patchSubCommandMention: `</${commandName} ${patchSubCommandName}:${applicationCommand.id}>`,
				attachSubCommandMention: `</${commandName} ${attachSubCommandName}:${applicationCommand.id}>`,
				detachSubCommandMention: `</${commandName} ${detachSubCommandName}:${applicationCommand.id}>`,
				channelOptionDescription: channelOptionDescription[locale],
				messageOptionDescription: messageOptionDescription[locale],
				contentOptionDescription: contentOptionDescription[locale],
				positionOptionDescription: positionOptionDescription[locale],
				attachmentOptionDescription: attachmentOptionDescription[locale],
			};
		}));
	},
};
export default chatCommand;
