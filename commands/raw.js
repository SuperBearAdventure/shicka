import discord from "discord.js";
import Command from "../command.js";
const {Util} = discord;
const listFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
const pattern = /^([1-9]\d*)$/;
const channels = new Set(["📰logs", "🛡moderators-room"]);
export default class RawCommand extends Command {
	async execute(message, parameters) {
		if (!channels.has(message.channel.name)) {
			return;
		}
		const {data} = message.client;
		if (parameters.length < 2) {
			const type = listFormat.format(Object.keys(data).map((type) => {
				return `\`${Util.escapeMarkdown(type)}\``;
			}));
			await message.channel.send(`Please give me a type among ${type}.`);
			return;
		}
		const type = parameters[1].toLowerCase();
		if (!(type in data)) {
			await message.channel.send(`I do not know any type with this name.`);
			return;
		}
		const array = data[type];
		if (parameters.length < 3) {
			await message.channel.send(`Please give me an identifier${array.length > 0 ? ` between \`0\` and \`${array.length - 1}\`` : ""}.`);
			return;
		}
		const identifier = parameters[2];
		const matches = identifier.match(pattern);
		if (matches === null || Number(identifier) >= array.length) {
			await message.channel.send(`I do not know any datum with this identifier.`);
			return;
		}
		const datum = Util.escapeMarkdown(JSON.stringify(array[identifier], null, "\t"));
		await message.channel.send(`\`\`\`json\n${datum}\n\`\`\``);
	}
	async describe(message, command) {
		if (!channels.has(message.channel.name)) {
			return "";
		}
		return `Type \`${command} Some type Some identifier\` to get the datum of \`Some type\` with \`Some identifier\``;
	}
}
