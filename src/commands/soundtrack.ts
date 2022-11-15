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
	"[*Main Theme*](<https://www.youtube.com/watch?v=uQm6CUKK0zE>)",
	"[*Bear Village*](<https://www.youtube.com/watch?v=z6Y5PZOjG7g>)",
	"[*Turtletown*](<https://www.youtube.com/watch?v=sChqMicL0pI>)",
	"[*Snow Valley*](<https://www.youtube.com/watch?v=JXiUd8yGJbE>)",
	"[*Boss Fight*](<https://www.youtube.com/watch?v=dsk9B0uHCCQ>)",
	"[*Beemothep Desert*](<https://www.youtube.com/watch?v=6FTl2dHIxE8>)",
	"[*Giant House*](<https://www.youtube.com/watch?v=lXILnN3VZHc>)",
	"[*Purple Honey*](<https://www.youtube.com/watch?v=YQnWLj47x0c>)",
	"[*The Hive*](<https://www.youtube.com/watch?v=PO66264Vvr8E>)",
	"[*Queen Beeatrice*](<https://www.youtube.com/watch?v=OEasvrqJDgY>)",
	"[*Special Mission*](<https://www.youtube.com/watch?v=RsN0IOEBjUY>)",
	"[*Arcade*](<https://www.youtube.com/watch?v=2jEpoCUQ6Ag>)",
	"[*I'm A Bear*](<https://www.youtube.com/watch?v=ClUAGMgRrBk>)",
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
