import Command from "../command.js";
const leaderboards = [
	"*Full-game leaderboard*: https://www.speedrun.com/sba",
	"*Turtle Village leaderboard*: https://www.speedrun.com/sba/Turtle_Village",
	"*Snow Valley leaderboard*: https://www.speedrun.com/sba/Snow_Valley",
	"*Beemothep Desert leaderboard*: https://www.speedrun.com/sba/Beemothep_Desert",
	"*Giant House leaderboard*: https://www.speedrun.com/sba/Giant_House",
	"*Missions leaderboard*: https://www.speedrun.com/sbace/Missions",
	"*Races leaderboard*: https://www.speedrun.com/sbace/Races",
	"*Category Extensions leaderboard*: https://www.speedrun.com/sbace",
];
export default class LeaderboardCommand extends Command {
	async execute(message, parameters) {
		const links = leaderboards.map((leaderboard) => {
			return `- ${leaderboard}`;
		}).join("\n");
		await (await message.reply(`You can watch community speedruns there:\n${links}`)).suppressEmbeds(true);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know where to watch community speedruns of the game`;
	}
}
