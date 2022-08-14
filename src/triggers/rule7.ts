import type {
	CommandInteraction,
	GuildBasedChannel,
	GuildEmoji,
	Message,
	Role,
} from "discord.js";
import type Trigger from "../triggers.js";
const pattern: RegExp = /\b(?:co-?op(?:erati(?:ons?|ve))?|consoles?|multi(?:-?player)?|online|pc|playstation|ps[45]|switch|xbox)\b/iu;
const roles: Set<string> = new Set(["Administrator", "Cookie", "Game Developer", "Moderator"]);
function computeHelpLocalizations(channel: GuildBasedChannel): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `I will gently reprimand you if you write words which violate the rule 7 in ${channel}`;
		},
	});
}
const rule7Trigger: Trigger = {
	async execute(message: Message): Promise<void> {
		const {channel}: Message = message;
		if (!("name" in channel) || channel.name !== "💡・game-suggestions") {
			return;
		}
		const {member}: Message = message;
		if (member == null) {
			return;
		}
		if (member.roles.cache.some((role: Role): boolean => {
			return roles.has(role.name);
		})) {
			return;
		}
		if (message.content.match(pattern) == null) {
			return;
		}
		const {guild}: Message = message;
		if (guild == null) {
			return;
		}
		const emoji: GuildEmoji | undefined = guild.emojis.cache.find((emoji: GuildEmoji): boolean => {
			return emoji.name === "RULE7";
		});
		if (emoji != null) {
			await message.reply(`${emoji}`);
		}
		const rulesChannel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "❗・rules-info・❗";
		});
		if (rulesChannel != null) {
			await message.reply(`Please read and respect the ${rulesChannel}!`);
		}
		await message.react("🇷");
		await message.react("🇺");
		await message.react("🇱");
		await message.react("🇪");
		await message.react("7️⃣");
		if (emoji != null) {
			await message.react(emoji);
		}
	},
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		const {guild}: CommandInteraction = interaction;
		if (guild == null) {
			return Object.create(null);
		}
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "💡・game-suggestions";
		});
		if (channel == null) {
			return Object.create(null);
		}
		return computeHelpLocalizations(channel);
	},
};
export default rule7Trigger;
