import type {
	ApplicationCommand,
	ApplicationCommandSubCommandData,
	Attachment,
	ChatInputCommandInteraction,
	Message,
} from "discord.js";
import type {Chat as ChatCompilation} from "../../compilations.js";
import type {Chat as ChatDefinition} from "../../definitions.js";
import type {Chat as ChatDependency} from "../../dependencies.js";
import type {Locale, Localized} from "../../utils/string.js";
import {
	ApplicationCommandOptionType,
	ChannelType,
	escapeMarkdown,
} from "discord.js";
import {chat as chatCompilation} from "../../compilations.js";
import {chat as chatDefinition} from "../../definitions.js";
import {composeAll, localize, resolve} from "../../utils/string.js";
type SubCommand = {
	register(): ApplicationCommandSubCommandData;
	interact(interaction: ChatInputCommandInteraction<"cached">, ...rest: unknown[]): Promise<void>;
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string>;
};
type DetachHelpGroups = ChatDependency["detachHelp"];
const {
	commandName,
	detachSubCommandName,
	detachSubCommandDescription,
	channelOptionName,
	channelOptionDescription,
	messageOptionName,
	messageOptionDescription,
	positionOptionName,
	positionOptionDescription,
}: ChatDefinition = chatDefinition;
const {
	detachHelp: detachHelpLocalizations,
	patchReply: patchReplyLocalizations,
	noPositionReply: noPositionReplyLocalizations,
	noContentOrAttachmentReply: noContentOrAttachmentReplyLocalizations,
	noPatchPermissionReply: noPatchPermissionReplyLocalizations,
}: ChatCompilation = chatCompilation;
const detachSubCommand: SubCommand = {
	register(): ApplicationCommandSubCommandData {
		return {
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
		};
	},
	async interact(interaction: ChatInputCommandInteraction<"cached">, message: Message<true>, position: number): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const content: string = message.content;
		const attachments: Attachment[] = [...message.attachments.values()];
		if (position < 0 || position >= attachments.length) {
			const max: number = attachments.length - 1;
			await interaction.reply({
				content: noPositionReplyLocalizations[resolvedLocale]({
					max: (): string => {
						return escapeMarkdown(`${max}`);
					},
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
			return patchReplyLocalizations[locale]({});
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
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<DetachHelpGroups, {}>(detachHelpLocalizations, localize<DetachHelpGroups>((locale: Locale): DetachHelpGroups => {
			return {
				detachSubCommandMention: (): string => {
					return `</${commandName} ${detachSubCommandName}:${applicationCommand.id}>`;
				},
				channelOptionDescription: (): string => {
					return channelOptionDescription[locale];
				},
				messageOptionDescription: (): string => {
					return messageOptionDescription[locale];
				},
				positionOptionDescription: (): string => {
					return positionOptionDescription[locale];
				},
			};
		}));
	},
};
export default detachSubCommand;
