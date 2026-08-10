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
} from "discord.js";
import {attach as attachCommand, detach as detachCommand, patch as patchCommand} from "../commands.js";
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
	attachmentsOptionName,
	attachmentsOptionDescription,
}: ChatDefinition = chatDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
	noContentOrAttachmentReply: noContentOrAttachmentReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
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
							required: false,
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
					],
				},
			],
			defaultMemberPermissions: [],
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {locale, options}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const subCommandName: string = options.getSubcommand(true);
		if (subCommandName === postSubCommandName) {
			const channel: GuildBasedChannel | null = options.getChannel(channelOptionName, false, [
				ChannelType.GuildText,
				ChannelType.GuildVoice,
				ChannelType.GuildAnnouncement,
				ChannelType.AnnouncementThread,
				ChannelType.PublicThread,
				ChannelType.PrivateThread,
				ChannelType.GuildStageVoice,
				ChannelType.GuildForum,
				ChannelType.GuildMedia,
			]) ?? interaction.channel;
			if (channel == null) {
				await interaction.reply({
					content: noChannelReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
			await interaction.showModal({
				customId: interaction.id,
				title: postSubCommandDescription[resolvedLocale],
				components: [
					{
						type: ComponentType.Label,
						label: contentOptionDescription[resolvedLocale],
						component: {
							type: ComponentType.TextInput,
							style: TextInputStyle.Paragraph,
							customId: contentOptionName,
							...{} as {label: string},
							value: "",
							required: false,
							minLength: 0,
							maxLength: 2000,
						},
					},
					{
						type: ComponentType.Label,
						label: attachmentsOptionDescription[resolvedLocale],
						component: {
							type: ComponentType.FileUpload,
							customId: attachmentsOptionName,
							required: false,
							minValues: 0,
							maxValues: 10,
						},
					},
				],
			});
			const modalSubmitInteraction: ModalSubmitInteraction<"cached"> = await interaction.awaitModalSubmit({
				filter: (modalSubmitInteraction: ModalSubmitInteraction): boolean => {
					return modalSubmitInteraction.customId === interaction.id;
				},
				time: 900000,
			});
			await modalSubmitInteraction.deferReply({
				ephemeral: true,
			});
			const content: string = modalSubmitInteraction.fields.getTextInputValue(contentOptionName);
			const files: Attachment[] = [...modalSubmitInteraction.fields.getUploadedFiles(attachmentsOptionName, false)?.values() ?? []];
			if (content === "" && files.length === 0) {
				await modalSubmitInteraction.editReply({
					content: noContentOrAttachmentReplyLocalizations[resolvedLocale]({}),
				});
				return;
			}
			try {
				if (channel.isThreadOnly()) {
					const name: string = "New post";
					await channel.threads.create({
						name,
						message: {content, files},
					});
				} else {
					await channel.send({content, files});
				}
			} catch {
				await modalSubmitInteraction.editReply({
					content: noPermissionReplyLocalizations[resolvedLocale]({}),
				});
				return;
			}
			function formatMessage(locale: Locale): string {
				return replyLocalizations[locale]({});
			}
			await modalSubmitInteraction.editReply({
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
			await attachCommand.interact(Object.assign(Object.create(interaction), {
				commandType: ApplicationCommandType.Message,
				get targetMessage(): Message<true> {
					return message;
				},
			}));
			return;
		}
		if (subCommandName === detachSubCommandName) {
			await detachCommand.interact(Object.assign(Object.create(interaction), {
				commandType: ApplicationCommandType.Message,
				get targetMessage(): Message<true> {
					return message;
				},
			}));
			return;
		}
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				postSubCommandMention: (): string => {
					return `</${commandName} ${postSubCommandName}:${applicationCommand.id}>`;
				},
				patchSubCommandMention: (): string => {
					return `</${commandName} ${patchSubCommandName}:${applicationCommand.id}>`;
				},
				attachSubCommandMention: (): string => {
					return `</${commandName} ${attachSubCommandName}:${applicationCommand.id}>`;
				},
				detachSubCommandMention: (): string => {
					return `</${commandName} ${detachSubCommandName}:${applicationCommand.id}>`;
				},
				channelOptionDescription: (): string => {
					return channelOptionDescription[locale];
				},
				messageOptionDescription: (): string => {
					return messageOptionDescription[locale];
				},
			};
		}));
	},
};
export default chatCommand;
