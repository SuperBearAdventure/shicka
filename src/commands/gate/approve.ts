import type {
	ApplicationCommand,
	ApplicationCommandSubCommandData,
	ChatInputCommandInteraction,
	Message,
} from "discord.js";
import type {Gate as GateCompilation} from "../../compilations.js";
import type {Gate as GateDefinition} from "../../definitions.js";
import type {Gate as GateDependency} from "../../dependencies.js";
import type {Locale, Localized} from "../../utils/string.js";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChannelType,
} from "discord.js";
import {approve as approveCommand} from "../../commands.js";
import {gate as gateCompilation} from "../../compilations.js";
import {gate as gateDefinition} from "../../definitions.js";
import {composeAll, localize} from "../../utils/string.js";
type SubCommand = {
	register(): ApplicationCommandSubCommandData;
	interact(interaction: ChatInputCommandInteraction<"cached">, ...rest: unknown[]): Promise<void>;
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string>;
};
type ApproveHelpGroups = GateDependency["approveHelp"];
const {
	commandName,
	approveSubCommandName,
	approveSubCommandDescription,
	channelOptionName,
	channelOptionDescription,
	messageOptionName,
	messageOptionDescription,
}: GateDefinition = gateDefinition;
const {
	approveHelp: approveHelpLocalizations,
	// approveReply: approveReplyLocalizations,
	// noMemberReply: noMemberReplyLocalizations,
	// noApprovePermissionReply: noApprovePermissionReplyLocalizations,
}: GateCompilation = gateCompilation;
const approveSubCommand: SubCommand = {
	register(): ApplicationCommandSubCommandData {
		return {
			type: ApplicationCommandOptionType.Subcommand,
			name: approveSubCommandName,
			description: approveSubCommandDescription["en-US"],
			descriptionLocalizations: approveSubCommandDescription,
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
		if (!interaction.isChatInputCommand()) {
			return;
		}
		await approveCommand.interact(Object.assign(Object.create(interaction), {
			commandType: ApplicationCommandType.Message,
			get targetMessage(): Message<true> {
				return message;
			},
		}));
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<ApproveHelpGroups, {}>(approveHelpLocalizations, localize<ApproveHelpGroups>((locale: Locale): ApproveHelpGroups => {
			return {
				approveSubCommandMention: (): string => {
					return `</${commandName} ${approveSubCommandName}:${applicationCommand.id}>`;
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
export default approveSubCommand;
