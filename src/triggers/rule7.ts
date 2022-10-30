import type {
	CommandInteraction,
	GuildBasedChannel,
	GuildEmoji,
	Message,
	Role,
} from "discord.js";
import type Trigger from "../triggers.js";
import type {Localized} from "../utils/string.js";
import {compileAll, composeAll, localize} from "../utils/string.js";
type HelpGroups = {
	channel: () => string,
};
const pattern: RegExp = /\b(?:co-?op(?:erati(?:ons?|ve))?|consoles?|multi(?:-?player)?|online|pc|playstation|ps[45]|switch|xbox)\b/iu;
const roles: Set<string> = new Set<string>(["Administrator", "Cookie", "Game Developer", "Moderator"]);
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "I will gently reprimand you if you write words which violate the rule 7 in $<channel>",
	"fr": "Je te réprimanderai gentiment si tu écris des mots qui violent la règle 7 dans $<channel>",
});
const rule7Trigger: Trigger = {
	async execute(message: Message): Promise<void> {
		const {channel}: Message = message;
		if (!("name" in channel) || channel.name !== "💡│game-suggestions") {
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
			await message.reply({
				content: `${emoji}`,
			});
		}
		const rulesChannel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "❗│rules-info│❗";
		});
		if (rulesChannel != null) {
			await message.reply({
				content: `Please read and respect the ${rulesChannel}!`,
			});
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
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
		const {guild}: CommandInteraction = interaction;
		if (guild == null) {
			return null;
		}
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "💡│game-suggestions";
		});
		if (channel == null) {
			return null;
		}
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				channel: (): string => {
					return `${channel}`;
				},
			};
		}));
	},
};
export default rule7Trigger;
