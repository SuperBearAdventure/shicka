import type {
	ApplicationCommand,
	ApplicationCommandData,
	ChatInputCommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Leaderboard as LeaderboardCompilation} from "../compilations.js";
import type {Leaderboard as LeaderboardDefinition} from "../definitions.js";
import type {Leaderboard as LeaderboardDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import {leaderboard as leaderboardCompilation} from "../compilations.js";
import {leaderboard as leaderboardDefinition} from "../definitions.js";
import {composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = LeaderboardDependency["help"];
type LinkGroups = LeaderboardDependency["link"];
type Data = {
	title: string,
	link: string,
};
const {
	commandName,
	commandDescription,
}: LeaderboardDefinition = leaderboardDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	link: linkLocalizations,
}: LeaderboardCompilation = leaderboardCompilation;
const data: Data[] = [
	{
		title: "Full-game",
		link: "https://www.speedrun.com/sba",
	},
	{
		title: "Turtletown",
		link: "https://www.speedrun.com/sba/Turtletown",
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
const leaderboardCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
		};
	},
	async execute(interaction: Interaction<"cached">): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const links: Localized<(groups: {}) => string>[] = [];
		for (const item of data) {
			const link: Localized<(groups: {}) => string> = composeAll<LinkGroups, {}>(linkLocalizations, localize<LinkGroups>((): LinkGroups => {
				return {
					title: (): string => {
						return escapeMarkdown(item.title);
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
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
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
