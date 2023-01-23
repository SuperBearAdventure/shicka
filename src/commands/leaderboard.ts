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
const commandName: string = "leaderboard";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you where to watch community speedruns of the game",
	"fr": "Te dit où regarder des speedruns communautaires du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const data: Data[] = [
	{
		title: "Full-game",
		link: "https://www.speedrun.com/sba",
	},
	{
		title: "Turtle Village",
		link: "https://www.speedrun.com/sba/Turtle_Village",
	},
	{
		title: "Snow Valley",
		link: "https://www.speedrun.com/sba/Snow_Valley",
	},
	{
		title: "Beemothep Desert",
		link: "https://www.speedrun.com/sba/Beemothep_Desert",
	},
	{
		title: "Giant House",
		link: "https://www.speedrun.com/sba/Giant_House",
	},
	{
		title: "Missions",
		link: "https://www.speedrun.com/sbace/Missions",
	},
	{
		title: "Races",
		link: "https://www.speedrun.com/sbace/Races",
	},
	{
		title: "Category Extensions",
		link: "https://www.speedrun.com/sbace",
	},
];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know where to watch community speedruns of the game",
	"fr": "Tape `/$<commandName>` pour savoir où regarder des speedruns communautaires du jeu",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "You can watch community speedruns there:\n$<linkList>",
	"fr": "Tu peux regarder des speedruns communautaires là :\n$<linkList>",
});
const linkLocalizations: Localized<((groups: LinkGroups) => string)> = compileAll<LinkGroups>({
	"en-US": "[*$<title>* leaderboard](<$<link>>)",
	"fr": "[Classement *$<title>*](<$<link>>)",
});
const leaderboardCommand: Command = {
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
		const {locale}: CommandInteraction = interaction;
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
};
export default leaderboardCommand;
