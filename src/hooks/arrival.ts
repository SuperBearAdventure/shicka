import type {
	Client,
	ClientEvents,
	Guild,
	GuildMember,
	Message,
} from "discord.js";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";
import type {Arrival as ArrivalCompilation} from "../compilations.js";
import type {Arrival as ArrivalDefinition} from "../definitions.js";
import type {Arrival as ArrivalDependency} from "../dependencies.js";
import type Hook from "../hooks.js";
import type {Webhook, WebhookData, WebjobInvocation} from "../hooks.js";
import type {Localized} from "../utils/string.js";
import {
	ChannelType,
	escapeMarkdown,
} from "discord.js";
import canvas from "canvas";
import {arrival as arrivalCompilation} from "../compilations.js";
import {arrival as arrivalDefinition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpWithChannelGroups = ArrivalDependency["helpWithChannel"];
type WebjobEvent<K extends keyof ClientEvents> = {
	type: K,
	data: ClientEvents[K],
};
const {
	hookName,
	hookReason,
}: ArrivalDefinition = arrivalDefinition;
const {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
	greetings,
}: ArrivalCompilation = arrivalCompilation;
const {
	SHICKA_ARRIVAL_DEFAULT_CHANNEL,
}: NodeJS.ProcessEnv = process.env;
const {createCanvas, loadImage}: any = canvas;
const hookChannel: string = SHICKA_ARRIVAL_DEFAULT_CHANNEL ?? "";
const hookAvatar: string = await (async (): Promise<string> => {
	const url: string = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 64 64" width="256" height="256"><circle cx="16" cy="16" r="24" fill="#ccc"/><path d="M5,16L20,16M14,10L20,16L14,22M25,7L25,25" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const image: Image = await loadImage(url);
	const canvas: Canvas = createCanvas(256, 256);
	const context: CanvasRenderingContext2D = canvas.getContext("2d");
	context.drawImage(image, 0, 0, 256, 256);
	const data: string = canvas.toDataURL();
	return data;
})();
const cardinalFormat: Intl.NumberFormat = new Intl.NumberFormat("en-US");
const arrivalHook: Hook = {
	register(): WebhookData {
		return {
			type: "guildMemberAdd",
			hookOptions: {
				name: hookName,
				reason: hookReason,
				channel: hookChannel,
				avatar: hookAvatar,
			},
		};
	},
	async invoke(invocation: WebjobInvocation): Promise<void> {
		if (invocation.event.type !== "guildMemberAdd") {
			return;
		}
		const [member]: ClientEvents["guildMemberAdd"] = (invocation.event as WebjobEvent<"guildMemberAdd">).data;
		const {guild}: GuildMember = member;
		const {memberCount}: Guild = guild;
		const greeting: string = greetings[Math.random() * greetings.length | 0]({
			memberMention: (): string => {
				return `<@${member.id}>`;
			},
		});
		const counting: string = memberCount % 10 !== 0 ? "" : `\nWe are now ${escapeMarkdown(cardinalFormat.format(memberCount))} members!`;
		const {client, webhooks}: WebjobInvocation = invocation;
		const {user}: Client<true> = client;
		const applicationName: string = user.username;
		const applicationIcon: string = user.displayAvatarURL();
		for (const webhook of webhooks) {
			const {channel}: Webhook = webhook;
			const arrival: string = `${greeting}${counting}`;
			const welcome: string = "New member arrival to the server";
			const message: Message<boolean> = await webhook.send({
				content: arrival,
				username: applicationName,
				avatarURL: applicationIcon,
				...(channel != null && channel.type === ChannelType.GuildForum ? {threadName: welcome} : {}),
			});
			await message.react("🇭");
			await message.react("🇪");
			await message.react("🇾");
			await message.react("👋");
		}
	},
	describe(webhook: Webhook): Localized<(groups: {}) => string> {
		const {channel}: Webhook = webhook;
		return channel != null ? composeAll<HelpWithChannelGroups, {}>(helpWithChannelLocalizations, localize<HelpWithChannelGroups>((): HelpWithChannelGroups => {
			return {
				channelMention: (): string => {
					return `<#${channel.id}>`;
				},
			};
		})) : helpWithoutChannelLocalizations;
	},
};
export default arrivalHook;
