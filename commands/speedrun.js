import Command from "../command.js";
const leaderboards = [
	"*Full-game*: https://www.speedrun.com/sba, https://www.speedrun.com/sbace",
	"*Turtle Village*: https://www.speedrun.com/sba/Turtle_Village",
	"*Snow Valley*: https://www.speedrun.com/sba/Snow_Valley",
	"*Beemothep Desert*: https://www.speedrun.com/sba/Beemothep_Desert",
	"*Giant House*: https://www.speedrun.com/sba/Giant_House",
	"*Missions*: https://www.speedrun.com/sbace/Missions",
	"*Races*: https://www.speedrun.com/sbace/Races",
];
export default class SpeedrunCommand extends Command {
	async execute(message, parameters) {
		const links = leaderboards.map((leaderboard) => {
			return `- ${leaderboard}`;
		}).join("\n");
		await (await message.channel.send(`You can check and watch the latest speedruns there:\n${links}`)).suppressEmbeds();
	}
	async describe(message, command) {
		return `Type \`${command}\` to know where to watch speedruns of the game`;
	}
}
