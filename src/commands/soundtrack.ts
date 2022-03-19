import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Localized} from "../utils/string.js";
import {compileAll, composeAll, list, localize} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
};
const commandName: string = "soundtrack";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you where to listen to official music pieces of the game",
	"fr": "Te dit où écouter des morceaux de musique officiels du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const soundtracks: string[] = [
	"[*Arcade World*](<https://www.youtube.com/watch?v=2jEpoCUQ6Ag>)",
	"[*Mission Realm*](<https://www.youtube.com/watch?v=31lyRu0jb6k>)",
	"[*Boss Fight*](<https://www.youtube.com/watch?v=7geObnVZXCg>)",
	"[*Final Boss*](<https://www.youtube.com/watch?v=cdmFBgS6Fc8>)",
	"[*I'm A Bear*](<https://www.youtube.com/watch?v=H_GzR4VbSSA>)",
];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know where to listen to official music pieces of the game",
	"fr": "Tape `/$<commandName>` pour savoir où écouter des morceaux de musique officiels du jeu",
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
		const linkList: string = list(soundtracks);
		await interaction.reply({
			content: `You can listen to official music pieces of the game there:\n${linkList}`,
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
