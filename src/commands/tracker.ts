import type {
	ChatInputCommandInteraction,
	ForumChannel,
	GuildBasedChannel,
	MediaChannel,
	NewsChannel,
	StageChannel,
	TextChannel,
	VoiceChannel,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Tracker as TrackerCompilation} from "../compilations.js";
import type {Tracker as TrackerDefinition} from "../definitions.js";
import type {Tracker as TrackerDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ChannelType,
	escapeMarkdown,
} from "discord.js";
import {tracker as trackerCompilation} from "../compilations.js";
import {tracker as trackerDefinition} from "../definitions.js";
import {composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = TrackerDependency["help"];
type LinkGroups = TrackerDependency["link"];
type Data = {
	title: Localized<string>,
	link: string,
};
const {
	commandName,
	commandDescription,
}: TrackerDefinition = trackerDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	intentWithChannel: intentWithChannelLocalizations,
	intentWithoutChannel: intentWithoutChannelLocalizations,
	link: linkLocalizations,
}: TrackerCompilation = trackerCompilation;
const {
	SHICKA_TRACKER_INTENT_CHANNEL,
}: NodeJS.ProcessEnv = process.env;
const data: Data[] = [
	{
		title: {
			"en-US": "Current",
			"fr": "actuel",
			"pt-BR": "atual",
		},
		link: "https://github.com/SuperBearAdventure/tracker",
	},
	{
		title: {
			"en-US": "Former",
			"fr": "antérieur",
			"pt-BR": "antigo",
		},
		link: "https://trello.com/b/yTojOuqv/super-bear-adventure-bugs",
	},
];
const commandIntentChannel: string = SHICKA_TRACKER_INTENT_CHANNEL ?? "";
const trackerCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {guild, locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const channel: TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | MediaChannel | null = guild.channels.cache.find((channel: GuildBasedChannel): channel is TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | MediaChannel => {
			return !channel.partial && channel.type !== ChannelType.GuildCategory && !channel.isThread() && channel.name === commandIntentChannel;
		}) ?? null;
		const links: Localized<(groups: {}) => string>[] = [];
		for (const item of data) {
			const link: Localized<(groups: {}) => string> = composeAll<LinkGroups, {}>(linkLocalizations, localize<LinkGroups>((locale: Locale): LinkGroups => {
				return {
					title: (): string => {
						return escapeMarkdown(item.title[locale]);
					},
					link: (): string => {
						return item.link;
					},
				};
			}));
			links.push(link);
		}
		function formatMessage(locale: Locale): string {
			return replyLocalizations[locale]({
				intent: (): string => {
					return channel != null ? intentWithChannelLocalizations[locale]({
						channelMention: (): string => {
							return `<#${channel.id}>`;
						},
					}) : intentWithoutChannelLocalizations[locale]({});
				},
				linkList: (): string => {
					return list(links.map<string>((link: Localized<(groups: {}) => string>): string => {
						return link[locale]({});
					}));
				},
			});
		}
		await interaction.reply({
			content: formatMessage("en-US"),
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
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				commandMention: (): string => {
					return `</${commandName}:${applicationCommand.id}>`;
				},
			};
		}));
	},
};
export default trackerCommand;
