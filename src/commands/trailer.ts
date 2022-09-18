import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Localized} from "../utils/string.js";
import {list} from "../utils/string.js";
const commandName: string = "trailer";
const commandDescription: string = "Tells you where to watch official trailers of the game";
const trailers: string[] = [
	"[*Main trailer*](<https://www.youtube.com/watch?v=L00uorYTYgE>)",
	"[*Missions trailer*](<https://www.youtube.com/watch?v=j3vwu0JWIEg>)",
];
function computeHelpLocalizations(): Localized<() => string> {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandName}\` to know where to watch official trailers of the game`;
		},
		"fr"(): string {
			return `Tape \`/${commandName}\` pour savoir où regarder des bandes-annonces officielles du jeu`;
		},
	});
}
const trailerCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const linkList: string = list(trailers);
		await interaction.reply({
			content: `You can watch official trailers of the game there:\n${linkList}`,
		});
	},
	describe(interaction: CommandInteraction): Localized<() => string> {
		return computeHelpLocalizations();
	},
};
export default trailerCommand;
