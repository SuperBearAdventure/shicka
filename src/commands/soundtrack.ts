import type {
	ApplicationCommandData,
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
	linkList: () => string,
};
type LinkGroups = {
	title: () => string,
	link: () => string,
};
type Data = {
	title: string,
	link: string,
};
const commandName: string = "soundtrack";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you where to listen to official music pieces of the game",
	"fr": "Te dit où écouter des morceaux de musique officiels du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const data: Data[] = [
	{
		title: "Main Theme",
		link: "https://www.youtube.com/watch?v=tgjAtWZa2iY",
	},
	{
		title: "Bear Village",
		link: "https://www.youtube.com/watch?v=HUgbx3tODUg",
	},
	{
		title: "Turtletown",
		link: "https://www.youtube.com/watch?v=PgG_Zs4e17Q",
	},
	{
		title: "Snow Valley",
		link: "https://www.youtube.com/watch?v=e-jT7NHD3lo",
	},
	{
		title: "Boss Fight",
		link: "https://www.youtube.com/watch?v=54_NtjLRQF4",
	},
	{
		title: "Beemothep Desert",
		link: "https://www.youtube.com/watch?v=T02PbOBL9Wo",
	},
	{
		title: "Giant House",
		link: "https://www.youtube.com/watch?v=l-YFNWZEQnQ",
	},
	{
		title: "Purple Honey",
		link: "https://www.youtube.com/watch?v=4iW8JVkoJTM",
	},
	{
		title: "The Hive",
		link: "https://www.youtube.com/watch?v=5w5my0zeJBE",
	},
	{
		title: "Queen Beeatrice",
		link: "https://www.youtube.com/watch?v=dtgwp7iit1A",
	},
	{
		title: "Special Mission",
		link: "https://www.youtube.com/watch?v=gN5dXMsMmsM",
	},
	{
		title: "Arcade World",
		link: "https://www.youtube.com/watch?v=2jEpoCUQ6Ag",
	},
	{
		title: "I'm A Bear",
		link: "https://www.youtube.com/watch?v=hlKVf1iSlwU",
	},
];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know where to listen to official music pieces of the game",
	"fr": "Tape `/$<commandName>` pour savoir où écouter des morceaux de musique officiels du jeu",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "You can listen to official music pieces of the game there:\n$<linkList>",
	"fr": "Tu peux écouter des morceaux de musique officiels du jeu là :\n$<linkList>",
});
const linkLocalizations: Localized<((groups: LinkGroups) => string)> = compileAll<LinkGroups>({
	"en-US": "[*$<title>* soundtrack](<$<link>>)",
	"fr": "[Bande-son *$<title>*](<$<link>>)",
});
const soundtrackCommand: Command = {
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
		const {locale}: Interaction = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const links: Localized<(groups: {}) => string>[] = [];
		for (const item of data) {
			const link: Localized<(groups: {}) => string> = composeAll<LinkGroups, {}>(linkLocalizations, localize<LinkGroups>((): LinkGroups => {
				return {
					title: (): string => {
						return Util.escapeMarkdown(item.title);
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
}
export default soundtrackCommand;
