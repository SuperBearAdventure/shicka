import {Command} from "./command.js";
const pattern = /^!trailer *$/isu;
async function execute(message) {
	await message.channel.send(`Watch the official trailer of *Super Bear Adventure* on *Earthkwak Games* *YouTube* channel!\nhttps://youtu.be/L00uorYTYgE`);
}
export class TrailerCommand extends Command {
	constructor() {
		super(pattern, execute);
	}
}
