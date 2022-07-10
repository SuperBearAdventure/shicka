import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const commandName: string = "trailer";
const commandDescription: string = "Tells you where to watch official trailers of the game";
const trailers: string[] = [
	"[*Main trailer*](<https://www.youtube.com/watch?v=L00uorYTYgE>)",
	"[*Missions trailer*](<https://www.youtube.com/watch?v=j3vwu0JWIEg>)",
];
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
		const linkList: string = trailers.map((trailer: string): string => {
			return `\u{2022} ${trailer}`;
		}).join("\n");
		await interaction.reply({
			content: `You can watch official trailers of the game there:\n${linkList}`,
		});
	},
	describe(interaction: CommandInteraction): string | null {
		return `Type \`/${commandName}\` to know where to watch official trailers of the game`;
	},
};
export default trailerCommand;