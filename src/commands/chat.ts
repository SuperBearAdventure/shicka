import type {
	ChatInputCommandInteraction,
	GuildBasedChannel,
	Message,
	ThreadChannel,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Chat as ChatCompilation} from "../compilations.js";
import type {Chat as ChatDefinition} from "../definitions.js";
import type {Chat as ChatDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ChannelType,
} from "discord.js";
import attachSubCommand from "./chat/attach.js";
import detachSubCommand from "./chat/detach.js";
import patchSubCommand from "./chat/patch.js";
import postSubCommand from "./chat/post.js";
import {chat as chatCompilation} from "../compilations.js";
import {chat as chatDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = ChatDependency["help"];
const {
	commandName,
	commandDescription,
	postSubCommandName,
	patchSubCommandName,
	attachSubCommandName,
	detachSubCommandName,
	channelOptionName,
	messageOptionName,
}: ChatDefinition = chatDefinition;
const {
	help: helpLocalizations,
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
}: ChatCompilation = chatCompilation;
const messagePattern: RegExp = /^(?:0|[1-9]\d*)$/;
const chatCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
			options: [
				postSubCommand.register(),
				patchSubCommand.register(),
				attachSubCommand.register(),
				detachSubCommand.register(),
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
			await postSubCommand.interact(interaction, channel);
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
			await patchSubCommand.interact(interaction, message);
			return;
		}
		if (subCommandName === attachSubCommandName) {
			await attachSubCommand.interact(interaction, message);
			return;
		}
		if (subCommandName === detachSubCommandName) {
			await detachSubCommand.interact(interaction, message);
			return;
		}
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				postSubCommandHelp: (): string => {
					return postSubCommand.describe(applicationCommand)[locale]({});
				},
				patchSubCommandHelp: (): string => {
					return patchSubCommand.describe(applicationCommand)[locale]({});
				},
				attachSubCommandHelp: (): string => {
					return attachSubCommand.describe(applicationCommand)[locale]({});
				},
				detachSubCommandHelp: (): string => {
					return detachSubCommand.describe(applicationCommand)[locale]({});
				},
			};
		}));
	},
};
export default chatCommand;
