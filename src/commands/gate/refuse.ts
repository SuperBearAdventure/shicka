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
import {refuse as refuseCommand} from "../../commands.js";
import {gate as gateCompilation} from "../../compilations.js";
import {gate as gateDefinition} from "../../definitions.js";
import {composeAll, localize} from "../../utils/string.js";
type SubCommand = {
	register(): ApplicationCommandSubCommandData;
	interact(interaction: ChatInputCommandInteraction<"cached">, ...rest: unknown[]): Promise<void>;
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string>;
};
type RefuseHelpGroups = GateDependency["refuseHelp"];
const {
	commandName,
	refuseSubCommandName,
	refuseSubCommandDescription,
	channelOptionName,
	channelOptionDescription,
	messageOptionName,
	messageOptionDescription,
}: GateDefinition = gateDefinition;
const {
	refuseHelp: refuseHelpLocalizations,
	// refuseReply: refuseReplyLocalizations,
	// noMemberReply: noMemberReplyLocalizations,
	// noRefusePermissionReply: noRefusePermissionReplyLocalizations,
}: GateCompilation = gateCompilation;
const refuseSubCommand: SubCommand = {
	register(): ApplicationCommandSubCommandData {
		return {
			type: ApplicationCommandOptionType.Subcommand,
			name: refuseSubCommandName,
			description: refuseSubCommandDescription["en-US"],
			descriptionLocalizations: refuseSubCommandDescription,
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
		await refuseCommand.interact(Object.assign(Object.create(interaction), {
			commandType: ApplicationCommandType.Message,
			get targetMessage(): Message<true> {
				return message;
			},
		}));
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<RefuseHelpGroups, {}>(refuseHelpLocalizations, localize<RefuseHelpGroups>((locale: Locale): RefuseHelpGroups => {
			return {
				refuseSubCommandMention: (): string => {
					return `</${commandName} ${refuseSubCommandName}:${applicationCommand.id}>`;
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
export default refuseSubCommand;
