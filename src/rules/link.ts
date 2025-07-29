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
import type {Link as LinkCompilation} from "../compilations.js";
import type {Link as LinkDefinition} from "../definitions.js";
import type {Link as LinkDependency} from "../dependencies.js";
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
import {link as linkCompilation} from "../compilations.js";
import {link as linkDefinition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpWithChannelsGroups = LinkDependency["helpWithChannels"];
const {
	ruleName,
	ruleReason,
}: LinkDefinition = linkDefinition;
const {
	helpWithChannels: helpWithChannelsLocalizations,
	helpWithoutChannels: helpWithoutChannelsLocalizations,
}: LinkCompilation = linkCompilation;
const {
	SHICKA_LINK_DEFAULT_ALERT_ACTION_CHANNEL,
	SHICKA_LINK_DEFAULT_EXEMPT_CHANNELS,
	SHICKA_LINK_DEFAULT_EXEMPT_ROLES,
	SHICKA_LINK_REACTION_EMOJI,
	SHICKA_LINK_OVERRIDE_RULES_CHANNEL,
}: NodeJS.ProcessEnv = process.env;
const {createCanvas, loadImage}: any = canvas;
const ruleTriggerRegexPatterns: string[] = [
	"<#\\d+>",
	"</['-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]+( ['-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]+){0,2}:\\d+>",
	"<@!?\\d+>",
	"<@&\\d+>",
	"<id:(browse|customize|guide|linked-roles(:\\d+)?)>",
	"<(mailto:[^<>@\\s]*|[^<>@\\s]+)@[^<>@\\s]+\\.[^<>@\\s]+>",
	"<(tel:|\\+)(\\(\\d+\\)|\\d)( ?(\\(\\d+\\)|\\d))+>",
	"\\bhttps?:///*\\S+",
	"\\bdiscord(\\.gg|\\.com/invite|app\\.com/invite)/\\S+",
];
const ruleAlertActionChannel: string = SHICKA_LINK_DEFAULT_ALERT_ACTION_CHANNEL ?? "";
const ruleExemptChannels: string[] | null = SHICKA_LINK_DEFAULT_EXEMPT_CHANNELS != null ? SHICKA_LINK_DEFAULT_EXEMPT_CHANNELS.split("\n") : null;
const ruleExemptRoles: string[] | null = SHICKA_LINK_DEFAULT_EXEMPT_ROLES != null ? SHICKA_LINK_DEFAULT_EXEMPT_ROLES.split("\n") : null;
const ruleRulesChannel: string | null = SHICKA_LINK_OVERRIDE_RULES_CHANNEL ?? null;
const ruleReactionEmoji: string = SHICKA_LINK_REACTION_EMOJI ?? "";
const ruleAvatar: string = await (async (): Promise<string> => {
	const url: string = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 64 64" width="256" height="256"><symbol id="letter-L" viewBox="0 0 24 32"><path d="M18,26L6,26L6,6"/></symbol><symbol id="letter-i" viewBox="0 0 12 32"><path d="M6,26L6,11M6,6L6,6"/></symbol><symbol id="letter-n" viewBox="0 0 20 32"><path d="M14,26L14,14Q14,10,10,10Q6,10,6,14L6,26M6,14L6,10"/></symbol><symbol id="letter-k" viewBox="0 0 20 32"><path d="M6,26L6,6M6,18L8,18M14,10L8,18L14,26"/></symbol><symbol id="link" viewBox="0 0 55 32"><use href="#letter-L" x="0" y="0" width="24" height="32"/><use href="#letter-i" x="17" y="0" width="12" height="32"/><use href="#letter-n" x="22" y="0" width="20" height="32"/><use href="#letter-k" x="35" y="0" width="20" height="32"/></symbol><circle cx="16" cy="16" r="24" fill="#ccc"/><use href="#link" x="2.25" y="8" width="27.5" height="16" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const image: Image = await loadImage(url);
	const canvas: Canvas = createCanvas(256, 256);
	const context: CanvasRenderingContext2D = canvas.getContext("2d");
	context.drawImage(image, 0, 0, 256, 256);
	const data: string = canvas.toDataURL();
	return data;
})();
const linkRule: Rule = {
	register(): AutoModerationRuleData {
		return {
			name: ruleName,
			reason: ruleReason,
			eventType: AutoModerationRuleEventType.MessageSend,
			triggerType: AutoModerationRuleTriggerType.Keyword,
			triggerMetadata: {
				regexPatterns: ruleTriggerRegexPatterns,
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
				return emoji.name === ruleReactionEmoji;
			});
			if (emoji == null || emoji.animated) {
				return null;
			}
			return emoji;
		})();
		try {
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
		} catch {}
		try {
			await message.react("🇱");
			await message.react("🇮");
			await message.react("🇳");
			await message.react("🇰");
			if (emoji != null) {
				await message.react(emoji);
			}
		} catch {}
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
export default linkRule;
