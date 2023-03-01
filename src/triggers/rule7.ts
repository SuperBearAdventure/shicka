import type {
	CommandInteraction,
	GuildBasedChannel,
	GuildEmoji,
	Message,
	Role,
	ThreadChannel,
} from "discord.js";
import type {Rule7 as Rule7Compilation} from "../compilations.js";
import type {Rule7 as Rule7Dependency} from "../dependencies.js";
import type Trigger from "../triggers.js";
import type {Localized} from "../utils/string.js";
import {rule7 as rule7Compilation} from "../compilations.js";
import {composeAll, localize} from "../utils/string.js";
type HelpGroups = Rule7Dependency["help"];
const {
	help: helpLocalizations,
}: Rule7Compilation = rule7Compilation;
const pattern: RegExp = /\b(?:co-?op(?:erati(?:ons?|ve))?|consoles?|multi(?:-?player)?|online|pc|playstation|ps[45]|switch|xbox)\b/iu;
const roles: Set<string> = new Set<string>(["Administrator", "Game Developer", "Helper", "Moderator", "Cookie"]);
const rule7Trigger: Trigger = {
	async execute(message: Message<true>): Promise<void> {
		const {channel}: Message<true> = message;
		if (!channel.isThread() && channel.name !== "💡│game-suggestions") {
			return;
		}
		if (channel.isThread()) {
			const {parent}: ThreadChannel = channel;
			if (parent == null || parent.name !== "💡│game-suggestions") {
				return;
			}
		}
		const {system}: Message<true> = message;
		if (system) {
			return;
		}
		const {member}: Message<true> = message;
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
		const {guild}: Message<true> = message;
		const emoji: GuildEmoji | undefined = guild.emojis.cache.find((emoji: GuildEmoji): boolean => {
			return emoji.name === "RULE7";
		});
		if (emoji != null) {
			await message.reply({
				content: `${emoji}`,
			});
		}
		const rulesChannel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "📕│rules-welcome";
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
	describe(interaction: CommandInteraction<"cached">): Localized<(groups: {}) => string> | null {
		const {guild}: CommandInteraction<"cached"> = interaction;
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
