import Command from "../command.js";
const leaderboards = [
	"*Full-game*, *Missions*, *Race*: https://www.speedrun.com/sba",
	"*Turtle Village*: https://www.speedrun.com/sba/Turtle_Village",
	"*Snow Valley*: https://www.speedrun.com/sba/Snow_Valley",
	"*Beemothep Desert*: https://www.speedrun.com/sba/Beemothep_Desert",
	"*Giant House*: https://www.speedrun.com/sba/Giant_House",
];
export default class SpeedrunCommand extends Command {
	async execute(message, parameters) {
		const links = leaderboards.map((leaderboard) => {
			return `- ${leaderboard}`;
		}).join("\n");
		await message.channel.send(`You can check and watch the latest speedruns there:\n${links}`);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know where to watch speedruns of the game`;
	}
}
