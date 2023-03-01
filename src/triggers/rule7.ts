import type {
	ChatInputCommandInteraction,
	GuildBasedChannel,
	GuildEmoji,
	Message,
	Role,
} from "discord.js";
import type {Rule7 as Rule7Compilation} from "../compilations.js";
import type {Rule7 as Rule7Dependency} from "../dependencies.js";
import type Trigger from "../triggers.js";
import type {Localized} from "../utils/string.js";
import {
	ChannelType,
	PermissionsBitField,
} from "discord.js";
import {rule7 as rule7Compilation} from "../compilations.js";
import {composeAll, localize} from "../utils/string.js";
type HelpGroups = Rule7Dependency["help"];
const {
	help: helpLocalizations,
}: Rule7Compilation = rule7Compilation;
const pattern: RegExp = /\b(?:co-?op(?:erati(?:ons?|ve))?|consoles?|multi(?:-?player)?|online|pc|playstation|ps[45]|switch|xbox)\b/iu;
const channels: Set<string> = new Set<string>(["💡│game-suggestions"]);
const roles: Set<string> = new Set<string>(["Administrator", "Moderator", "Helper", "Cookie"]);
const rule7Trigger: Trigger = {
	async execute(message: Message<true>): Promise<void> {
		const channel: GuildBasedChannel | null = ((): GuildBasedChannel | null => {
			const {channel}: Message<true> = message;
			if (channel.isThread()) {
				return channel.parent;
			}
			return channel;
		})();
		if (channel == null || !channels.has(channel.name)) {
			return;
		}
		const {system}: Message<true> = message;
		if (system) {
			return;
		}
		const {member}: Message<true> = message;
		if (member == null) {
			return;
		}
		const {guild}: Message<true> = message;
		if (guild.ownerId === member.id) {
			return;
		}
		if (member.permissions.has(PermissionsBitField.All)) {
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
		const emoji: GuildEmoji | undefined = guild.emojis.cache.find((emoji: GuildEmoji): boolean => {
			return emoji.name === "RULE7";
		});
		if (emoji != null) {
			await message.reply({
				content: `${emoji}`,
			});
		}
		const rulesChannel: GuildBasedChannel | null = ((): GuildBasedChannel | null => {
			const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
				return channel.name === "📕│rules-welcome";
			});
			if (channel == null || channel.type === ChannelType.GuildCategory || channel.isThread()) {
				return null;
			}
			return channel;
		})();
		if (rulesChannel != null && rulesChannel.isTextBased()) {
			await message.reply({
				content: `Please read and respect the rules in ${rulesChannel}!`,
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
	describe(interaction: ChatInputCommandInteraction<"cached">): Localized<(groups: {}) => string> | null {
		const {guild}: ChatInputCommandInteraction<"cached"> = interaction;
		const channel: GuildBasedChannel | null = ((): GuildBasedChannel | null => {
			const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
				return channel.name === "💡│game-suggestions";
			});
			if (channel == null || channel.type === ChannelType.GuildCategory || channel.isThread()) {
				return null;
			}
			return channel;
		})();
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
