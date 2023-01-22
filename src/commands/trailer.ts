import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Locale, Localized} from "../utils/string.js";
import {compileAll, composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	linkList: () => string,
};
const commandName: string = "trailer";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you where to watch official trailers of the game",
	"fr": "Te dit où regarder des bandes-annonces officielles du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const trailers: string[] = [
	"[*Main trailer*](<https://www.youtube.com/watch?v=L00uorYTYgE>)",
	"[*Missions trailer*](<https://www.youtube.com/watch?v=j3vwu0JWIEg>)",
	"[*Hive trailer*](<https://www.youtube.com/watch?v=bT0Dj_FQJ1M>)",
];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know where to watch official trailers of the game",
	"fr": "Tape `/$<commandName>` pour savoir où regarder des bandes-annonces officielles du jeu",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "You can watch official trailers of the game there:\n$<linkList>",
	"fr": "Tu peux regarder des bandes-annonces officielles du jeu là :\n$<linkList>",
});
const trailerCommand: Command = {
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
		const linkList: string = list(trailers);
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				linkList: (): string => {
					return linkList;
				},
			}),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: replyLocalizations[resolvedLocale]({
				linkList: (): string => {
					return linkList;
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
export default trailerCommand;
