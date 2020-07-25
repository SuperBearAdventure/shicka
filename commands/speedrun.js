import Command from "../command.js";
export default class SpeedrunCommand extends Command {
	async execute(message, parameters) {
		await message.channel.send("You can check and watch the latest speedruns there:\nhttps://www.speedrun.com/super_bear_adventure");
	}
	async describe(message, command) {
		return `Type \`${command}\` to know where to watch speedruns of the game`;
	}
}
