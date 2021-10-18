import discord from "discord.js";
import Command from "../command.js";
const {MessageMentions} = discord;
const {source} = MessageMentions.CHANNELS_PATTERN;
const messagePattern = /^(?:0|[1-9]\d*)$/;
const channelPattern = new RegExp(`^(?:${source})$`, "");
const channels = new Set(["🔎logs", "🛡moderators-room"]);
export default class ChatCommand extends Command {
	async execute(message, parameters) {
		if (!channels.has(message.channel.name)) {
			return;
		}
		if (parameters.length < 2) {
			await message.reply(`Please give me a message identifier or a channel tag.`);
			return;
		}
		const channelMatches = parameters[1].match(channelPattern);
		if (channelMatches === null) {
			const messageMatches = parameters[1].match(messagePattern);
			if (messageMatches === null) {
				await message.reply(`I do not know any message with this identifier or channel with this tag.`);
				return;
			}
			if (parameters.length < 3) {
				await message.reply(`Please give me a channel tag.`);
				return;
			}
			const channelMatches = parameters[2].match(channelPattern);
			if (channelMatches === null) {
				await message.reply(`I do not know any channel with this tag.`);
				return;
			}
			const channel = message.guild.channels.cache.get(channelMatches[1]);
			if (typeof channel === "undefined") {
				await message.reply(`I do not know any channel with this tag.`);
				return;
			}
			const target = await (async () => {
				try {
					return await channel.messages.fetch(parameters[1]);
				} catch {}
			})();
			if (typeof target === "undefined") {
				await message.reply(`I do not know any message with this identifier in this channel.`);
				return;
			}
			if (parameters.length < 4 && target.attachments.size === 0) {
				await message.reply(`Please give me an inline message.`);
				return;
			}
			const content = parameters.length < 4 ? null : parameters.slice(3).join(" ");
			await (await target.edit(content)).suppressEmbeds(true);
			return;
		}
		const channel = message.guild.channels.cache.get(channelMatches[1]);
		if (typeof channel === "undefined") {
			await message.reply(`I do not know any channel with this tag.`);
			return;
		}
		if (parameters.length < 3 && message.attachments.size === 0) {
			await message.reply(`Please give me an inline message or attachments.`);
			return;
		}
		const content = parameters.length < 3 ? null : parameters.slice(2).join(" ");
		const files = message.attachments.map((attachment) => {
			const {name, url} = attachment;
			return {
				attachment: url,
				name: name,
			};
		});
		await (await channel.send({content, files})).suppressEmbeds(true);
	}
	async describe(message, command) {
		if (!channels.has(message.channel.name)) {
			return "";
		}
		return `Type \`${command} Some channel Some text\` to post \`Some text\` and some attachments in \`Some channel\`\nType \`${command} Some message Some channel Some text\` to edit \`Some message\` with \`Some text\` in \`Some channel\``;
	}
}
