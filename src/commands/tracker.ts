import type {
	ApplicationCommandData,
	GuildBasedChannel,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {compileAll, composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	intent: () => string,
	linkList: () => string,
};
type IntentWithChannelGroups = {
	channel: () => string,
};
type IntentWithoutChannelGroups = {};
type LinkGroups = {
	title: () => string,
	link: () => string,
};
type Data = {
	title: Localized<string>,
	link: string,
};
const commandName: string = "tracker";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you where to check known bugs of the game",
	"fr": "Te dit où consulter des bogues connus du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const data: Data[] = [
	{
		title: {
			"en-US": "Current",
			"fr": "actuel",
		},
		link: "https://github.com/SuperBearAdventure/tracker",
	},
	{
		title: {
			"en-US": "Former",
			"fr": "antérieur",
		},
		link: "https://trello.com/b/yTojOuqv/super-bear-adventure-bugs",
	},
];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know where to check known bugs of the game",
	"fr": "Tape `/$<commandName>` pour savoir où consulter des bogues connus du jeu",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "$<intent> check the known bugs of the game there:\n$<linkList>",
	"fr": "$<intent> consulter des bogues connus du jeu là :\n$<linkList>",
});
const intentWithChannelLocalizations: Localized<(groups: IntentWithChannelGroups) => string> = compileAll<IntentWithChannelGroups>({
	"en-US": "Before reporting a bug in $<channel>, you can",
	"fr": "Avant de rapporter un bogue dans $<channel>, tu peux",
});
const intentWithoutChannelLocalizations: Localized<(groups: IntentWithoutChannelGroups) => string> = compileAll<IntentWithoutChannelGroups>({
	"en-US": "You can",
	"fr": "Tu peux",
});
const linkLocalizations: Localized<((groups: LinkGroups) => string)> = compileAll<LinkGroups>({
	"en-US": "[$<title> tracker](<$<link>>)",
	"fr": "[Suivi $<title>](<$<link>>)",
});
const trackerCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {guild, locale}: CommandInteraction = interaction;
		const resolvedLocale: Locale = resolve(locale);
		if (guild == null) {
			return;
		}
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "🐛│bug-report";
		});
		const links: Localized<(groups: {}) => string>[] = [];
		for (const item of data) {
			const link: Localized<(groups: {}) => string> = composeAll<LinkGroups, {}>(linkLocalizations, localize<LinkGroups>((locale: keyof Localized<unknown>): LinkGroups => {
				return {
					title: (): string => {
						return Util.escapeMarkdown(item.title[locale]);
					},
					link: (): string => {
						return item.link;
					},
				};
			}));
			links.push(link);
		}
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				intent: (): string => {
					return channel != null ? intentWithChannelLocalizations["en-US"]({
						channel: (): string => {
							return `${channel}`;
						},
					}) : intentWithoutChannelLocalizations["en-US"]({});
				},
				linkList: (): string => {
					return list(links.map<string>((link: Localized<(groups: {}) => string>): string => {
						return link["en-US"]({});
					}));
				},
			}),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: replyLocalizations[resolvedLocale]({
				intent: (): string => {
					return channel != null ? intentWithChannelLocalizations[resolvedLocale]({
						channel: (): string => {
							return `${channel}`;
						},
					}) : intentWithoutChannelLocalizations[resolvedLocale]({});
				},
				linkList: (): string => {
					return list(links.map<string>((link: Localized<(groups: {}) => string>): string => {
						return link[resolvedLocale]({});
					}));
				},
			}),
			ephemeral: true,
		});
	},
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
			};
		}));
	},
};
export default trackerCommand;
