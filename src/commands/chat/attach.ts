import type {
	ApplicationCommand,
	ApplicationCommandSubCommandData,
	ChatInputCommandInteraction,
	Message,
} from "discord.js";
import type {Chat as ChatCompilation} from "../../compilations.js";
import type {Chat as ChatDefinition} from "../../definitions.js";
import type {Chat as ChatDependency} from "../../dependencies.js";
import type {Locale, Localized} from "../../utils/string.js";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChannelType,
} from "discord.js";
import {attach as attachCommand} from "../../commands.js";
import {chat as chatCompilation} from "../../compilations.js";
import {chat as chatDefinition} from "../../definitions.js";
import {composeAll, localize} from "../../utils/string.js";
type SubCommand = {
	register(): ApplicationCommandSubCommandData;
	interact(interaction: ChatInputCommandInteraction<"cached">, ...rest: unknown[]): Promise<void>;
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string>;
};
type AttachHelpGroups = ChatDependency["attachHelp"];
const {
	commandName,
	attachSubCommandName,
	attachSubCommandDescription,
	channelOptionName,
	channelOptionDescription,
	messageOptionName,
	messageOptionDescription,
}: ChatDefinition = chatDefinition;
const {
	attachHelp: attachHelpLocalizations,
}: ChatCompilation = chatCompilation;
const attachSubCommand: SubCommand = {
	register(): ApplicationCommandSubCommandData {
		return {
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
		};
	},
	async interact(interaction: ChatInputCommandInteraction<"cached">, message: Message<true>): Promise<void> {
		await attachCommand.interact(Object.assign(Object.create(interaction), {
			commandType: ApplicationCommandType.Message,
			get targetMessage(): Message<true> {
				return message;
			},
		}));
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<AttachHelpGroups, {}>(attachHelpLocalizations, localize<AttachHelpGroups>((locale: Locale): AttachHelpGroups => {
			return {
				attachSubCommandMention: (): string => {
					return `</${commandName} ${attachSubCommandName}:${applicationCommand.id}>`;
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
export default attachSubCommand;
