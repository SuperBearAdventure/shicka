import type {
	AutoModerationAction,
	AutoModerationActionExecution,
	AutoModerationActionMetadata,
	AutoModerationActionMetadataOptions,
	AutoModerationActionOptions,
	AutoModerationRule,
	AutoModerationRuleCreateOptions,
	Guild,
	GuildBasedChannel,
	GuildEmoji,
	Message,
	NewsChannel,
	TextChannel,
	ThreadChannel,
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
const {
	SHICKA_RULE7_DEFAULT_ALERT_ACTION_CHANNEL,
	SHICKA_RULE7_DEFAULT_EXEMPT_CHANNELS,
	SHICKA_RULE7_DEFAULT_EXEMPT_ROLES,
	SHICKA_RULE7_REACTION_EMOJI,
	SHICKA_RULE7_OVERRIDE_RULES_CHANNEL,
}: NodeJS.ProcessEnv = process.env;
const ruleTriggerRegexPattern: string = "\\bco-?op(?:erati(?:ons?|ve))?\\b|\\bconsoles?\\b|\\bmulti(?:-?player)?\\b|\\bonline\\b|\\bpc\\b|\\bplaystation\\b|\\bps[456]\\b|\\bswitch\\b|\\bxbox\\b";
const ruleAlertActionChannel: string = SHICKA_RULE7_DEFAULT_ALERT_ACTION_CHANNEL ?? "";
const ruleExemptChannels: string[] | null = SHICKA_RULE7_DEFAULT_EXEMPT_CHANNELS != null ? SHICKA_RULE7_DEFAULT_EXEMPT_CHANNELS.split("\n") : null;
const ruleExemptRoles: string[] | null = SHICKA_RULE7_DEFAULT_EXEMPT_ROLES != null ? SHICKA_RULE7_DEFAULT_EXEMPT_ROLES.split("\n") : null;
const ruleReactionEmoji: string = SHICKA_RULE7_REACTION_EMOJI ?? "";
const ruleRulesChannel: string | null = SHICKA_RULE7_OVERRIDE_RULES_CHANNEL ?? null;
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
			...(ruleExemptChannels != null ? {exemptChannels: ruleExemptChannels} : {}),
			...(ruleExemptRoles != null ? {exemptRoles: ruleExemptRoles} : {}),
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
		if (channel.isThread() && channel.id === messageId) {
			return;
		}
		const message: Message<boolean> | undefined = await (async (): Promise<Message<boolean> | undefined> => {
			try {
				if (channel.type === ChannelType.GuildForum) {
					const thread: ThreadChannel | undefined = channel.threads.cache.get(messageId);
					if (thread == null) {
						return;
					}
					return await thread.messages.fetch(messageId);
				}
				return await channel.messages.fetch(messageId);
			} catch {}
		})();
		if (message == null) {
			return;
		}
		const {guild}: AutoModerationActionExecution = execution;
		const emoji: GuildEmoji | null = ((): GuildEmoji | null => {
			const emoji: GuildEmoji | undefined = guild.emojis.cache.find((emoji: GuildEmoji): boolean => {
				return (emoji.name ?? "") === ruleReactionEmoji;
			});
			if (emoji == null || (emoji.animated ?? true)) {
				return null;
			}
			return emoji;
		})();
		if (emoji != null) {
			await message.reply({
				content: `<:${ruleReactionEmoji}:${emoji.id}>`,
			});
		}
		const {rulesChannel}: Guild = guild;
		const manualChannel: TextChannel | null = ruleRulesChannel != null ? ((): TextChannel | null => {
			const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
				return channel.name === ruleRulesChannel;
			});
			if (channel == null || channel.type !== ChannelType.GuildText) {
				return null;
			}
			return channel;
		})() : rulesChannel;
		if (manualChannel != null) {
			await message.reply({
				content: `Please read and respect the rules in <#${manualChannel.id}>!`,
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
		const channels: (TextChannel | NewsChannel)[] = autoModerationRule.actions.map<TextChannel | NewsChannel | null>((action: AutoModerationAction): TextChannel | NewsChannel | null => {
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
			const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(locale, {
				style: "long",
				type: "conjunction",
			});
			return {
				channelMentions: (): string => {
					return conjunctionFormat.format(channels.map<string>((channel: TextChannel | NewsChannel): string => {
						return `<#${channel.id}>`;
					}));
				},
			};
		})) : helpWithoutChannelsLocalizations;
	},
};
export default rule7Rule;
