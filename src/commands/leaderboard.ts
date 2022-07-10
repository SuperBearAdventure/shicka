import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const commandName: string = "leaderboard";
const commandDescription: string = "Tells you where to watch community speedruns of the game";
const leaderboards: string[] = [
	"[*Full-game leaderboard*](<https://www.speedrun.com/sba>)",
	"[*Turtle Village leaderboard*](<https://www.speedrun.com/sba/Turtle_Village>)",
	"[*Snow Valley leaderboard*](<https://www.speedrun.com/sba/Snow_Valley>)",
	"[*Beemothep Desert leaderboard*](<https://www.speedrun.com/sba/Beemothep_Desert>)",
	"[*Giant House leaderboard*](<https://www.speedrun.com/sba/Giant_House>)",
	"[*Missions leaderboard*](<https://www.speedrun.com/sbace/Missions>)",
	"[*Races leaderboard*](<https://www.speedrun.com/sbace/Races>)",
	"[*Category Extensions leaderboard*](<https://www.speedrun.com/sbace>)",
];
const leaderboardCommand: Command = {
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
		const linkList: string = leaderboards.map((leaderboard: string): string => {
			return `\u{2022} ${leaderboard}`;
		}).join("\n");
		await interaction.reply({
			content: `You can watch community speedruns there:\n${linkList}`,
		});
	},
	describe(interaction: CommandInteraction): string | null {
		return `Type \`/${commandName}\` to know where to watch community speedruns of the game`;
	},
};
export default leaderboardCommand;