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
const commandName: string = "soundtrack";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you where to listen to official music pieces of the game",
	"fr": "Te dit où écouter des morceaux de musique officiels du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const soundtracks: string[] = [
	"[*Main Theme*](<https://www.youtube.com/watch?v=tgjAtWZa2iY>)",
	"[*Bear Village*](<https://www.youtube.com/watch?v=HUgbx3tODUg>)",
	"[*Turtletown*](<https://www.youtube.com/watch?v=PgG_Zs4e17Q>)",
	"[*Snow Valley*](<https://www.youtube.com/watch?v=e-jT7NHD3lo>)",
	"[*Boss Fight*](<https://www.youtube.com/watch?v=54_NtjLRQF4>)",
	"[*Beemothep Desert*](<https://www.youtube.com/watch?v=T02PbOBL9Wo>)",
	"[*Giant House*](<https://www.youtube.com/watch?v=l-YFNWZEQnQ>)",
	"[*Purple Honey*](<https://www.youtube.com/watch?v=4iW8JVkoJTM>)",
	"[*The Hive*](<https://www.youtube.com/watch?v=5w5my0zeJBE>)",
	"[*Queen Beeatrice*](<https://www.youtube.com/watch?v=dtgwp7iit1A>)",
	"[*Special Mission*](<https://www.youtube.com/watch?v=gN5dXMsMmsM>)",
	"[*Arcade World*](<https://www.youtube.com/watch?v=2jEpoCUQ6Ag>)",
	"[*I'm A Bear*](<https://www.youtube.com/watch?v=hlKVf1iSlwU>)",
];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know where to listen to official music pieces of the game",
	"fr": "Tape `/$<commandName>` pour savoir où écouter des morceaux de musique officiels du jeu",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "You can listen to official music pieces of the game there:\n$<linkList>",
	"fr": "Tu peux écouter des morceaux de musique officiels du jeu là :\n$<linkList>",
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
		const linkList: string = list(soundtracks);
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
}
export default soundtrackCommand;
