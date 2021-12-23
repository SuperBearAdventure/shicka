import discord from "discord.js";
import Grant from "../grant.js";
const {MessageMentions} = discord;
const {source} = MessageMentions.CHANNELS_PATTERN;
const messagePattern = /^(?:0|[1-9]\d*)$/;
const channelPattern = new RegExp(`^(?:${source})$`, "");
const channels = new Set(["🔎・logs", "🛡・moderators-room"]);
export default class ChatGrant extends Grant {
	async execute(message, parameters, tokens) {
		if (!channels.has(message.channel.name)) {
			return;
		}
		if (parameters.length < 2) {
			await message.reply(`Please give me a message identifier or a channel tag.`);
			return;
		}
		const channelMatches = parameters[1].match(channelPattern);
		if (channelMatches == null) {
			const messageMatches = parameters[1].match(messagePattern);
			if (messageMatches == null) {
				await message.reply(`I do not know any message with this identifier or channel with this tag.`);
				return;
			}
			if (parameters.length < 3) {
				await message.reply(`Please give me a channel tag.`);
				return;
			}
			const channelMatches = parameters[2].match(channelPattern);
			if (channelMatches == null) {
				await message.reply(`I do not know any channel with this tag.`);
				return;
			}
			const channel = await (async () => {
				try {
					return await message.guild.channels.fetch(channelMatches[1]);
				} catch {}
			})();
			if (channel == null) {
				await message.reply(`I do not know any channel with this tag.`);
				return;
			}
			const target = await (async () => {
				try {
					return await channel.messages.fetch(parameters[1]);
				} catch {}
			})();
			if (target == null) {
				await message.reply(`I do not know any message with this identifier in this channel.`);
				return;
			}
			if (parameters.length < 4 && message.attachments.size === 0) {
				await message.reply(`Please give me a content or attachments.`);
				return;
			}
			const content = parameters.length < 4 ? null : tokens.slice(7).join("");
			const files = message.attachments.map((attachment) => {
				const {name, url} = attachment;
				return {
					attachment: url,
					name: name,
				};
			});
			const attachments = [];
			try {
				await target.edit({content, files, attachments});
			} catch {
				await message.reply(`I do not have the rights to edit this message.`);
			}
			return;
		}
		const channel = await (async () => {
			try {
				return await message.guild.channels.fetch(channelMatches[1]);
			} catch {}
		})();
		if (channel == null) {
			await message.reply(`I do not know any channel with this tag.`);
			return;
		}
		if (parameters.length < 3 && message.attachments.size === 0) {
			await message.reply(`Please give me a content or attachments.`);
			return;
		}
		const content = parameters.length < 3 ? null : tokens.slice(5).join("");
		const files = message.attachments.map((attachment) => {
			const {name, url} = attachment;
			return {
				attachment: url,
				name: name,
			};
		});
		try {
			await channel.send({content, files});
		} catch {
			await message.reply(`I do not have the rights to send this message.`);
		}
	}
	describe(interaction, name) {
		return channels.has(interaction.channel.name) ? `Type \`/${name} Some channel Some content\` to send \`Some content\` and some attachments in \`Some channel\`\nType \`/${name} Some message Some channel Some content\` to edit \`Some message\` with \`Some content\` and some attachments in \`Some channel\`` : null;
	}
}
