import type {
	AutoModerationAction,
	AutoModerationActionMetadata,
	Guild,
	GuildBasedChannel,
	GuildEmoji,
	Message,
	NewsChannel,
	TextChannel,
	ThreadChannel,
} from "discord.js";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";
import type {Rule7 as Rule7Compilation} from "../compilations.js";
import type {Rule7 as Rule7Definition} from "../definitions.js";
import type {Rule7 as Rule7Dependency} from "../dependencies.js";
import type Rule from "../rules.js";
import type {AutoModerationActionExecution, AutoModerationRule, AutoModerationRuleData} from "../rules.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	AutoModerationActionType,
	AutoModerationRuleEventType,
	AutoModerationRuleTriggerType,
	ChannelType,
} from "discord.js";
import canvas from "canvas";
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
const {createCanvas, loadImage}: any = canvas;
const ruleTriggerRegexPattern: string = "\\bco-?op(?:erati(?:ons?|ve))?\\b|\\bmulti(?:-?player)?\\b|\\bonline\\b|\\bpc\\b|\\bplaystation\\b|\\bps[456]\\b|\\bxbox\\b";
const ruleAlertActionChannel: string = SHICKA_RULE7_DEFAULT_ALERT_ACTION_CHANNEL ?? "";
const ruleExemptChannels: string[] | null = SHICKA_RULE7_DEFAULT_EXEMPT_CHANNELS != null ? SHICKA_RULE7_DEFAULT_EXEMPT_CHANNELS.split("\n") : null;
const ruleExemptRoles: string[] | null = SHICKA_RULE7_DEFAULT_EXEMPT_ROLES != null ? SHICKA_RULE7_DEFAULT_EXEMPT_ROLES.split("\n") : null;
const ruleReactionEmoji: string = SHICKA_RULE7_REACTION_EMOJI ?? "";
const ruleRulesChannel: string | null = SHICKA_RULE7_OVERRIDE_RULES_CHANNEL ?? null;
const ruleAvatar: string = await (async (): Promise<string> => {
	const url: string = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 64 64" width="256" height="256"><symbol id="letter-R" viewBox="0 0 24 32"><path d="M6,26L6,6L12,6Q18,6,18,12Q18,18,12,18L6,18M12,18L18,26"/></symbol><symbol id="letter-u" viewBox="0 0 20 32"><path d="M14,10L14,22Q14,26,10,26Q6,26,6,22L6,10M14,22L14,26"/></symbol><symbol id="letter-l" viewBox="0 0 14 32"><path d="M8,26Q6,26,6,24L6,6"/></symbol><symbol id="letter-e" viewBox="0 0 20 32"><path d="M14,22Q14,26,10,26Q6,26,6,22L6,14Q6,10,10,10Q14,10,14,14Q14,18,10,18Q6,18,6,22"/></symbol><symbol id="letter-7" viewBox="0 0 20 32"><path d="M6,10L6,6L14,6L14,10L10,26"/></symbol><symbol id="rule7" viewBox="0 0 68 32"><use href="#letter-R" x="0" y="0" width="24" height="32"/><use href="#letter-u" x="17" y="0" width="20" height="32"/><use href="#letter-l" x="30" y="0" width="14" height="32"/><use href="#letter-e" x="36" y="0" width="20" height="32"/><use href="#letter-7" x="48" y="0" width="20" height="32"/></symbol><circle cx="16" cy="16" r="24" fill="#ccc"/><use href="#rule7" x="-1" y="8" width="34" height="16" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const image: Image = await loadImage(url);
	const canvas: Canvas = createCanvas(256, 256);
	const context: CanvasRenderingContext2D = canvas.getContext("2d");
	context.drawImage(image, 0, 0, 256, 256);
	const data: string = canvas.toDataURL();
	return data;
})();
const rule7Rule: Rule = {
	register(): AutoModerationRuleData {
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
		const message: Message<true> | undefined = await (async (): Promise<Message<true> | undefined> => {
			try {
				if (channel.isThreadOnly()) {
					const thread: ThreadChannel<boolean> | undefined = channel.threads.cache.get(messageId);
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
				return null;
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
