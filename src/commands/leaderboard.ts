import Command from "../command.js";
const leaderboards = [
	"[*Full-game leaderboard*](<https://www.speedrun.com/sba>)",
	"[*Turtle Village leaderboard*](<https://www.speedrun.com/sba/Turtle_Village>)",
	"[*Snow Valley leaderboard*](<https://www.speedrun.com/sba/Snow_Valley>)",
	"[*Beemothep Desert leaderboard*](<https://www.speedrun.com/sba/Beemothep_Desert>)",
	"[*Giant House leaderboard*](<https://www.speedrun.com/sba/Giant_House>)",
	"[*Missions leaderboard*](<https://www.speedrun.com/sbace/Missions>)",
	"[*Races leaderboard*](<https://www.speedrun.com/sbace/Races>)",
	"[*Category Extensions leaderboard*](<https://www.speedrun.com/sbace>)",
];
export default class LeaderboardCommand extends Command {
	register(client, name) {
		const description = "Tells you where to watch community speedruns of the game";
		return {name, description};
	}
	async execute(interaction) {
		const linkList = leaderboards.map((leaderboard) => {
			return `\u{2022} ${leaderboard}`;
		}).join("\n");
		await interaction.reply({
			content: `You can watch community speedruns there:\n${linkList}`,
		});
	}
	describe(interaction, name) {
		return `Type \`/${name}\` to know where to watch community speedruns of the game`;
	}
}
