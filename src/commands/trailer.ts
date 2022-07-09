import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const commandNameLocalizations: {[k: string]: string} = {
	"en-US": "trailer",
	"fr": "bande-annonce",
};
const commandName: string = commandNameLocalizations["en-US"];
const commandDescriptionLocalizations: {[k: string]: string} = {
	"en-US": "Tells you where to watch official trailers of the game",
	"fr": "Te dit où regarder des bandes-annonces officielles du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const trailers: string[] = [
	"[*Main trailer*](<https://www.youtube.com/watch?v=L00uorYTYgE>)",
	"[*Missions trailer*](<https://www.youtube.com/watch?v=j3vwu0JWIEg>)",
];
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandNameLocalizations["en-US"]}\` to know where to watch official trailers of the game`;
		},
		"fr"(): string {
			return `Tape \`/${commandNameLocalizations["fr"]}\` pour savoir où regarder des bandes-annonces officielles du jeu`;
		},
	});
}
const trailerCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			nameLocalizations: commandNameLocalizations,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const linkList: string = trailers.map((trailer: string): string => {
			return `\u{2022} ${trailer}`;
		}).join("\n");
		await interaction.reply({
			content: `You can watch official trailers of the game there:\n${linkList}`,
		});
	},
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		return computeHelpLocalizations();
	},
};
export default trailerCommand;
