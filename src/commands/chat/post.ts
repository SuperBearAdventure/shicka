import type {
	ApplicationCommand,
	ApplicationCommandSubCommandData,
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
}: ChatDefinition = chatDefinition;
const {
	postHelp: postHelpLocalizations,
	postReply: postReplyLocalizations,
	noPostPermissionReply: noPostPermissionReplyLocalizations,
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
		};
	},
	async interact(interaction: ChatInputCommandInteraction<"cached">, channel: Exclude<GuildBasedChannel, CategoryChannel>): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
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
			return postReplyLocalizations[locale]({});
		}
		await modalSubmitInteraction.reply({
			content: formatMessage("en-US"),
			ephemeral: true,
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
				contentOptionDescription: (): string => {
					return contentOptionDescription[locale];
				},
			};
		}));
	},
};
export default postSubCommand;
