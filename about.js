import {Command} from "./command.js";
const pattern = /^!about *$/isu;
async function execute(message) {
	await message.channel.send("I am *Shicka*, a bot made by *PolariTOON*, and I am open source!\nMy code is available there:\nhttps://github.com/SuperBearAdventure/shicka");
}
export class AboutCommand extends Command {
	constructor() {
		super(pattern, execute);
	}
	toString() {
		return "Type `!about` to know where I come from";
	}
}
