import Command from "../command.js";
export default class AboutCommand extends Command {
	async execute(message, parameters) {
		await message.channel.send("I am *Shicka*, a bot made by *PolariTOON*, and I am open source!\nMy code is available there:\nhttps://github.com/SuperBearAdventure/shicka");
	}
	async describe(message, command) {
		return `Type \`${command}\` to know where I come from`;
	}
}
