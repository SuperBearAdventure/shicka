import type {
	ChatInputCommandInteraction,
	GuildBasedChannel,
	Message,
	ThreadChannel,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Gate as GateCompilation} from "../compilations.js";
import type {Gate as GateDefinition} from "../definitions.js";
import type {Gate as GateDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChannelType,
} from "discord.js";
import {approve as approveCommand, refuse as refuseCommand} from "../commands.js";
import {gate as gateCompilation} from "../compilations.js";
import {gate as gateDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = GateDependency["help"];
const {
	commandName,
	commandDescription,
	approveSubCommandName,
	approveSubCommandDescription,
	refuseSubCommandName,
	refuseSubCommandDescription,
	channelOptionName,
	channelOptionDescription,
	messageOptionName,
	messageOptionDescription,
}: GateDefinition = gateDefinition;
const {
	help: helpLocalizations,
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
}: GateCompilation = gateCompilation;
const messagePattern: RegExp = /^(?:0|[1-9]\d*)$/;
const gateCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
			options: [
				{
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
				},
				{
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
		if (subCommandName === approveSubCommandName) {
			await approveCommand.interact(Object.assign(Object.create(interaction), {
				commandType: ApplicationCommandType.Message,
				get targetMessage(): Message<true> {
					return message;
				},
			}));
			return;
		}
		if (subCommandName === refuseSubCommandName) {
			await refuseCommand.interact(Object.assign(Object.create(interaction), {
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
				approveSubCommandMention: `</${commandName} ${approveSubCommandName}:${applicationCommand.id}>`,
				refuseSubCommandMention: `</${commandName} ${refuseSubCommandName}:${applicationCommand.id}>`,
				channelOptionDescription: channelOptionDescription[locale],
				messageOptionDescription: messageOptionDescription[locale],
			};
		}));
	},
};
export default gateCommand;
