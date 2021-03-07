import Command from "../command.js";
export default class HelpCommand extends Command {
	async execute(message, parameters) {
		const {author, client} = message;
		const {prefix, commands, feeds, triggers} = client;
		const commandPromises = Object.entries(commands).map(async ([name, action]) => {
			return await action.describe(message, `${prefix}${name}`);
		});
		const feedPromises = Object.entries(feeds).map(async ([name, action]) => {
			return await action.describe(message);
		});
		const triggerPromises = Object.entries(triggers).map(async ([name, action]) => {
			return await action.describe(message);
		});
		const help = (await Promise.all([
			Promise.all(commandPromises),
			Promise.all(feedPromises),
			Promise.all(triggerPromises),
		])).flat().map((description) => {
			return description.split("\n").filter((item) => {
				return item !== "";
			}).map((item) => {
				return `- ${item}`;
			});
		}).flat().join("\n");
		await message.channel.send(`Hey ${author}, there you are!\nI can give you some advice about the server:\n${help}`);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know the features I offer`;
	}
}
