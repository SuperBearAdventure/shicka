import Command from "../command.js";
const newline = /\n/g;
export default class HelpCommand extends Command {
	async execute(message, parameters) {
		const {author, client} = message;
		const {prefix, commands, feeds, triggers} = client;
		const commandPromises = commands.map(async (action, name) => {
			return await action.describe(message, `${prefix}${name}`);
		});
		const feedPromises = feeds.map(async (action, name) => {
			return await action.describe(message);
		});
		const triggerPromises = triggers.map(async (action, name) => {
			return await action.describe(message);
		});
		const help = (await Promise.all([
			Promise.all(commandPromises),
			Promise.all(feedPromises),
			Promise.all(triggerPromises),
		])).flat().filter((description) => {
			return description !== "";
		}).map((description) => {
			const item = description.replace(newline, " ");
			return `- ${item}`;
		}).join("\n");
		await message.channel.send(`Hey ${author}, there you are!\nI can give you some advice about the server:\n${help}`);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know the features I offer`;
	}
}
