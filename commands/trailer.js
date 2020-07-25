import Command from "../command.js";
export default class TrailerCommand extends Command {
	async execute(message, parameters) {
		await message.channel.send(`Watch the official trailer of *Super Bear Adventure* on *Earthkwak Games* *YouTube* channel!\nhttps://youtu.be/L00uorYTYgE`);
	}
	async describe(message, command) {
		return `Type \`${command}\` to watch the trailer of the game`;
	}
}
