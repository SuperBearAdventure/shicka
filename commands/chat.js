import discord from "discord.js";
import Command from "../command.js";
const {MessageAttachment, MessageMentions} = discord;
const {source} = MessageMentions.CHANNELS_PATTERN;
const pattern = new RegExp(`^(?:${source})$`, "");
const channels = new Set(["bot", "moderation"]);
export default class ChatCommand extends Command {
	async execute(message, parameters) {
		if (!channels.has(message.channel.name)) {
			return;
		}
		if (parameters.length < 2) {
			await message.channel.send(`Please give me a channel.`);
			return;
		}
		const matches = parameters[1].match(pattern);
		if (matches === null) {
			await message.channel.send(`I do not know any channel with this name.`);
			return;
		}
		const channel = message.guild.channels.cache.get(matches[1]);
		if (typeof channel === "undefined") {
			await message.channel.send(`I do not know any channel with this name.`);
			return;
		}
		if (parameters.length < 3 && message.attachments.size === 0) {
			await message.channel.send(`Please give me an inline message or attachments.`);
			return;
		}
		const attachments = message.attachments.map((attachment) => {
			const {name, url} = attachment;
			return new MessageAttachment(url, name);
		});
		await channel.send(parameters.slice(2).join(" "), attachments);
	}
	async describe(message, command) {
		if (!channels.has(message.channel.name)) {
			return "";
		}
		return `Type \`${command} #channel\` to post attachments in the given channel \`#channel\`\nType \`${command} #channel Some text\` to post an inline message \`Some text\` in the given channel \`#channel\``;
	}
}
