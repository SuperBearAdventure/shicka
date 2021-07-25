import Command from "../command.js";
export default class SpeedrunCommand extends Command {
	async execute(message, parameters) {
		const {commands, prefix} = message.client;
		await commands.leaderboard.execute(message, ["speedrun", ...parameters.slice(1)]);
		await message.channel.send(`> By the way, \`${prefix}speedrun\` is deprecated and will be removed soon, please use \`${prefix}leaderboard\` instead.`);
	}
	async describe(message, command) {
		return "";
	}
}
