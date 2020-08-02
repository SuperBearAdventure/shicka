import Command from "../command.js";
const pattern = /^<#(\d{17,19})>$/;
const channels = new Set(["bot", "moderation"]);
export default class ChatCommand extends Command {
	async execute(message, parameters) {
		if (!channels.has(message.channel.name)) {
			return;
		}
		if (parameters.length < 3) {
			return;
		}
		const matches = parameters[1].match(pattern);
		if (matches === null) {
			return;
		}
		const channel = message.guild.channels.cache.get(matches[1]);
		if (typeof channel === "undefined") {
			return;
		}
		await channel.send(parameters.slice(2).join(" "));
	}
	async describe(message, command) {
		if (!channels.has(message.channel.name)) {
			return "";
		}
		return `Type \`${command} #channel Some text\` to post an inline message \`Some text\` in the given channel \`#channel\``;
	}
}
