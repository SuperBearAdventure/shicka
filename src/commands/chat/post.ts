import type {
	ApplicationCommand,
	ApplicationCommandSubCommandData,
	Attachment,
	CategoryChannel,
	ChatInputCommandInteraction,
	GuildBasedChannel,
	ModalSubmitInteraction,
} from "discord.js";
import type {Chat as ChatCompilation} from "../../compilations.js";
import type {Chat as ChatDefinition} from "../../definitions.js";
import type {Chat as ChatDependency} from "../../dependencies.js";
import type {Locale, Localized} from "../../utils/string.js";
import {
	ApplicationCommandOptionType,
	ChannelType,
	ComponentType,
	TextInputStyle,
} from "discord.js";
import {chat as chatCompilation} from "../../compilations.js";
import {chat as chatDefinition} from "../../definitions.js";
import {composeAll, localize, resolve} from "../../utils/string.js";
type SubCommand = {
	register(): ApplicationCommandSubCommandData;
	interact(interaction: ChatInputCommandInteraction<"cached">, ...rest: unknown[]): Promise<void>;
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string>;
};
type PostHelpGroups = ChatDependency["postHelp"];
const {
	commandName,
	postSubCommandName,
	postSubCommandDescription,
	channelOptionName,
	channelOptionDescription,
	contentOptionName,
	contentOptionDescription,
	attachmentsOptionName,
	attachmentsOptionDescription,
}: ChatDefinition = chatDefinition;
const {
	postHelp: postHelpLocalizations,
	reply: replyLocalizations,
	noContentOrAttachmentReply: noContentOrAttachmentReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
}: ChatCompilation = chatCompilation;
const postSubCommand: SubCommand = {
	register(): ApplicationCommandSubCommandData {
		return {
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
		};
	},
	async interact(interaction: ChatInputCommandInteraction<"cached">, channel: Exclude<GuildBasedChannel, CategoryChannel>): Promise<void> {
		const {locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
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
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<PostHelpGroups, {}>(postHelpLocalizations, localize<PostHelpGroups>((locale: Locale): PostHelpGroups => {
			return {
				postSubCommandMention: (): string => {
					return `</${commandName} ${postSubCommandName}:${applicationCommand.id}>`;
				},
				channelOptionDescription: (): string => {
					return channelOptionDescription[locale];
				},
			};
		}));
	},
};
export default postSubCommand;
