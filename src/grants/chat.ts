import type {
	CommandInteraction,
	FileOptions,
	GuildBasedChannel,
	Message,
	MessageAttachment,
} from "discord.js";
import type Grant from "../grants.js";
import type {Localized} from "../utils/string.js";
import {MessageMentions} from "discord.js";
const grantName: string = "chat";
const messageArgumentDescription: string = "Some message";
const channelArgumentDescription: string = "Some channel";
const contentArgumentDescription: string = "Some content";
const {source}: RegExp = MessageMentions.CHANNELS_PATTERN;
const messagePattern: RegExp = /^(?:0|[1-9]\d*)$/;
const channelPattern: RegExp = new RegExp(`^(?:${source})$`, "");
const channels: Set<string> = new Set(["🔧│console", "🔎│logs", "🛡│moderators-room"]);
const helpLocalizations: Localized<() => string> = Object.assign(Object.create(null), {
	"en-US"(): string {
		return `Type \`/${grantName} ${channelArgumentDescription} ${contentArgumentDescription}\` to send \`${contentArgumentDescription}\` and some attachments in \`${channelArgumentDescription}\`\nType \`/${grantName} ${messageArgumentDescription} ${channelArgumentDescription} ${contentArgumentDescription}\` to edit \`${messageArgumentDescription}\` with \`${contentArgumentDescription}\` and some attachments in \`${channelArgumentDescription}\``;
	},
	"fr"(): string {
		return `Tape \`/${grantName} ${channelArgumentDescription} ${contentArgumentDescription}\` pour envoyer \`${contentArgumentDescription}\` et des pièces jointes dans \`${channelArgumentDescription}\`\nTape \`/${grantName} ${messageArgumentDescription} ${channelArgumentDescription} ${contentArgumentDescription}\` pour modifier \`${messageArgumentDescription}\` avec \`${contentArgumentDescription}\` et des pièces jointes dans \`${channelArgumentDescription}\``;
	},
});
const chatGrant: Grant = {
	async execute(message: Message, parameters: string[], tokens: string[]): Promise<void> {
		const {channel}: Message = message;
		if (!("name" in channel) || !channels.has(channel.name)) {
			return;
		}
		const {guild}: Message = message;
		if (guild == null) {
			return;
		}
		if (parameters.length < 2) {
			await message.reply({
				content: `Please give me a message identifier or a channel tag.`,
			});
			return;
		}
		const channelMatches: RegExpMatchArray | null = parameters[1].match(channelPattern);
		if (channelMatches == null) {
			const messageMatches: RegExpMatchArray | null = parameters[1].match(messagePattern);
			if (messageMatches == null) {
				await message.reply({
					content: `I do not know any message with this identifier or channel with this tag.`,
				});
				return;
			}
			if (parameters.length < 3) {
				await message.reply({
					content: `Please give me a channel tag.`,
				});
				return;
			}
			const channelMatches: RegExpMatchArray | null = parameters[2].match(channelPattern);
			if (channelMatches == null) {
				await message.reply({
					content: `I do not know any channel with this tag.`,
				});
				return;
			}
			const targetChannel: GuildBasedChannel | null = await (async (): Promise<GuildBasedChannel | null> => {
				try {
					return await guild.channels.fetch(channelMatches[1]);
				} catch {}
				return null;
			})();
			if (targetChannel == null || !("messages" in targetChannel)) {
				await message.reply({
					content: `I do not know any channel with this tag.`,
				});
				return;
			}
			const targetMessage: Message | null = await (async (): Promise<Message | null> => {
				try {
					return await targetChannel.messages.fetch(parameters[1]);
				} catch {}
				return null;
			})();
			if (targetMessage == null) {
				await message.reply({
					content: `I do not know any message with this identifier in this channel.`,
				});
				return;
			}
			if (targetMessage.interaction != null) {
				await message.reply({
					content: `I can not edit interaction replies or follow-ups.`,
				});
				return;
			}
			if (parameters.length < 4 && message.attachments.size === 0) {
				await message.reply({
					content: `Please give me a content or attachments.`,
				});
				return;
			}
			const content: string | null = parameters.length < 4 ? null : tokens.slice(7).join("");
			const files: FileOptions[] = message.attachments.map((attachment: MessageAttachment): FileOptions => {
				const {name, url}: MessageAttachment = attachment;
				return {
					attachment: url,
					name: name ?? "",
				};
			});
			const attachments: MessageAttachment[] = [];
			try {
				await targetMessage.edit({content, files, attachments});
			} catch {
				await message.reply({
					content: `I do not have the rights to edit this message.`,
				});
			}
			return;
		}
		const targetChannel: GuildBasedChannel | null = await (async (): Promise<GuildBasedChannel | null> => {
			try {
				return await guild.channels.fetch(channelMatches[1]);
			} catch {}
			return null;
		})();
		if (targetChannel == null || !("messages" in targetChannel)) {
			await message.reply({
				content: `I do not know any channel with this tag.`,
			});
			return;
		}
		if (parameters.length < 3 && message.attachments.size === 0) {
			await message.reply({
				content: `Please give me a content or attachments.`,
			});
			return;
		}
		const content: string | null = parameters.length < 3 ? null : tokens.slice(5).join("");
		const files: FileOptions[] = message.attachments.map((attachment: MessageAttachment): FileOptions => {
			const {name, url}: MessageAttachment = attachment;
			return {
				attachment: url,
				name: name ?? "",
			};
		});
		try {
			await targetChannel.send({content, files});
		} catch {
			await message.reply({
				content: `I do not have the rights to send this message.`,
			});
		}
	},
	describe(interaction: CommandInteraction): Localized<() => string> {
		const {channel}: CommandInteraction = interaction;
		if (channel == null || !("name" in channel) || !channels.has(channel.name)) {
			return Object.create(null);
		}
		return helpLocalizations;
	},
};
export default chatGrant;
