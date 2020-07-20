import {Command} from "./command.js";
const pattern = /^!count *$/isu;
async function execute(message) {
	const {memberCount} = message.guild;
	await message.channel.send(`There are ${memberCount} members on the official *Super Bear Adventure* *Discord* server!`);
}
export class CountCommand extends Command {
	constructor() {
		super(pattern, execute);
	}
	toString() {
		return "Type `!count` to know the number of members on the server";
	}
}
