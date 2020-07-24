import {Command} from "./command.js";
const newline = /\n/g;
const pattern = /^!help *$/isu;
async function execute(commands, message) {
	const help = commands.map((command) => {
		return `- ${command.toString().replace(newline, " ")}`;
	}).join("\n");
	await message.channel.send(`Hey ${message.author}, there you are!\nI can give you some advice about the server:\n${help}`);
}
export class HelpCommand extends Command {
	constructor(commands) {
		super(pattern, async (message, ...parameters) => {
			await execute(commands, message, ...parameters);
		});
	}
	toString() {
		return "Type `!help` to know the features of the bot";
	}
}
