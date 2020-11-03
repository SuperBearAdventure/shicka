import Command from "../command.js";
export default class WikiCommand extends Command {
	async execute(message, parameters) {
		await message.channel.send("You can contribute to a community wiki about the game there:\nhttps://3d-platformer-super-bear-adventure.fandom.com/");
	}
	async describe(message, command) {
		return `Type \`${command}\` to know where to learn more about the game`;
	}
}
