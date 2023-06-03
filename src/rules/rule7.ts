import type {
	AutoModerationAction,
	AutoModerationActionExecution,
	AutoModerationActionMetadata,
	AutoModerationActionMetadataOptions,
	AutoModerationActionOptions,
	AutoModerationRule,
	AutoModerationRuleCreateOptions,
	GuildBasedChannel,
	GuildEmoji,
	Message,
	NewsChannel,
	TextChannel,
} from "discord.js";
import type {Rule7 as Rule7Compilation} from "../compilations.js";
import type {Rule7 as Rule7Definition} from "../definitions.js";
import type {Rule7 as Rule7Dependency} from "../dependencies.js";
import type Rule from "../rules.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	AutoModerationActionType,
	AutoModerationRuleEventType,
	AutoModerationRuleTriggerType,
	ChannelType,
} from "discord.js";
import {rule7 as rule7Compilation} from "../compilations.js";
import {rule7 as rule7Definition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpWithChannelsGroups = Rule7Dependency["helpWithChannels"];
const {
	ruleName,
	ruleReason,
}: Rule7Definition = rule7Definition;
const {
	helpWithChannels: helpWithChannelsLocalizations,
	helpWithoutChannels: helpWithoutChannelsLocalizations,
}: Rule7Compilation = rule7Compilation;
const ruleTriggerRegexPattern: string = "\\bco-?op(?:erati(?:ons?|ve))?\\b|\\bconsoles?\\b|\\bmulti(?:-?player)?\\b|\\bonline\\b|\\bpc\\b|\\bplaystation\\b|\\bps[456]\\b|\\bswitch\\b|\\bxbox\\b";
const ruleExemptChannels: Set<string> = new Set<string>([]);
const ruleExemptRoles: Set<string> = new Set<string>(["Administrator", "Moderator", "Helper", "Cookie"]);
const ruleAlertActionChannel: string = "🔎│logs";
const rule7Rule: Rule = {
	register(): Omit<AutoModerationRuleCreateOptions, "exemptChannels" | "exemptRoles" | "actions"> & {exemptChannels?: string[], exemptRoles?: string[], actions: (Omit<AutoModerationActionOptions, "metadata"> & {metadata?: Omit<AutoModerationActionMetadataOptions, "channel"> & {channel?: string}})[]} {
		return {
			name: ruleName,
			reason: ruleReason,
			eventType: AutoModerationRuleEventType.MessageSend,
			triggerType: AutoModerationRuleTriggerType.Keyword,
			triggerMetadata: {
				regexPatterns: [ruleTriggerRegexPattern],
			},
			exemptChannels: Array.from(ruleExemptChannels),
			exemptRoles: Array.from(ruleExemptRoles),
			actions: [
				{
					type: AutoModerationActionType.SendAlertMessage,
					metadata: {
						channel: ruleAlertActionChannel,
					},
				},
			],
			enabled: true,
		};
	},
	async execute(execution: AutoModerationActionExecution): Promise<void> {
		const {channel}: AutoModerationActionExecution = execution;
		if (channel == null) {
			return;
		}
		const {messageId}: AutoModerationActionExecution = execution;
		if (messageId == null) {
			return;
		}
		const message: Message<boolean> | undefined = await (async (): Promise<Message<boolean> | undefined> => {
			try {
				return await channel.messages.fetch(messageId);
			} catch {}
		})();
		if (message == null) {
			return;
		}
		const {guild}: AutoModerationActionExecution = execution;
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
		if (rulesChannel != null) {
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
	describe(autoModerationRule: AutoModerationRule): Localized<(groups: {}) => string> {
		const channels: (TextChannel | NewsChannel)[] = autoModerationRule.actions.map<any | null>((action: AutoModerationAction): TextChannel | NewsChannel | null => {
			const {metadata}: AutoModerationAction = action;
			const {channelId}: AutoModerationActionMetadata = metadata;
			if (channelId == null) {
				return null
			}
			const channel: GuildBasedChannel | undefined = autoModerationRule.guild.channels.cache.get(channelId);
			if (channel == null || channel.isThread() || channel.isVoiceBased() || !channel.isTextBased()) {
				return null;
			}
			return channel;
		}).filter<TextChannel | NewsChannel>((channel: TextChannel | NewsChannel | null): channel is TextChannel | NewsChannel => {
			return channel != null;
		});
		return channels.length !== 0 ? composeAll<HelpWithChannelsGroups, {}>(helpWithChannelsLocalizations, localize<HelpWithChannelsGroups>((locale: Locale): HelpWithChannelsGroups => {
			return {
				channels: (): string => {
					const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(locale, {
						style: "long",
						type: "conjunction",
					});
					return conjunctionFormat.format(channels.map<string>((channel: TextChannel | NewsChannel): string => {
						return `${channel}`;
					}));
				},
			};
		})) : helpWithoutChannelsLocalizations;
	},
};
export default rule7Rule;
