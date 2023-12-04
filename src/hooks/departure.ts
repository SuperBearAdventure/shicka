import type {
	Client,
	ClientEvents,
	Message,
} from "discord.js";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";
import type {Departure as DepartureCompilation} from "../compilations.js";
import type {Departure as DepartureDefinition} from "../definitions.js";
import type {Departure as DepartureDependency} from "../dependencies.js";
import type Hook from "../hooks.js";
import type {Webhook, WebhookData, WebjobInvocation} from "../hooks.js";
import type {Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import canvas from "canvas";
import {departure as departureCompilation} from "../compilations.js";
import {departure as departureDefinition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpWithChannelGroups = DepartureDependency["helpWithChannel"];
type WebjobEvent<K extends keyof ClientEvents> = {
	type: K,
	data: ClientEvents[K],
};
const {
	hookName,
	hookReason,
}: DepartureDefinition = departureDefinition;
const {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
	greetings,
}: DepartureCompilation = departureCompilation;
const {
	SHICKA_DEPARTURE_DEFAULT_CHANNEL,
}: NodeJS.ProcessEnv = process.env;
const {createCanvas, loadImage}: any = canvas;
const hookChannel: string = SHICKA_DEPARTURE_DEFAULT_CHANNEL ?? "";
const hookAvatar: string = await (async (): Promise<string> => {
	const url: string = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 64 64" width="256" height="256"><circle cx="16" cy="16" r="24" fill="#ccc"/><path d="M20,16L5,16M11,10L5,16L11,22M25,7L25,25" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const image: Image = await loadImage(url);
	const canvas: Canvas = createCanvas(256, 256);
	const context: CanvasRenderingContext2D = canvas.getContext("2d");
	context.drawImage(image, 0, 0, 256, 256);
	const data: string = canvas.toDataURL();
	return data;
})();
const departureHook: Hook = {
	register(): WebhookData {
		return {
			type: "guildMemberRemove",
			hookOptions: {
				name: hookName,
				reason: hookReason,
				channel: hookChannel,
				avatar: hookAvatar,
			},
		};
	},
	async invoke(invocation: WebjobInvocation): Promise<void> {
		if (invocation.event.type !== "guildMemberRemove") {
			return;
		}
		const [member]: ClientEvents["guildMemberRemove"] = (invocation.event as WebjobEvent<"guildMemberRemove">).data;
		if (member.partial) {
			return;
		}
		const greeting: string = greetings[Math.random() * greetings.length | 0]({
			memberMention: (): string => {
				return `**${escapeMarkdown(member.user.username)}**${member.user.discriminator != null && member.user.discriminator !== "0" ? `#**${escapeMarkdown(member.user.discriminator)}**` : ""}${member.user.globalName != null ? ` (**${escapeMarkdown(member.user.globalName)}**)` : ""}`;
			},
		});
		const {client, webhooks}: WebjobInvocation = invocation;
		const {user}: Client<true> = client;
		const applicationName: string = user.username;
		const applicationIcon: string = user.displayAvatarURL();
		for (const webhook of webhooks) {
			const {channel}: Webhook = webhook;
			const departure: string = greeting;
			const farewell: string = "New member departure from the server";
			const message: Message<boolean> = await webhook.send({
				content: departure,
				username: applicationName,
				avatarURL: applicationIcon,
				...(channel != null && channel.isThreadOnly() ? {threadName: farewell} : {}),
			});
			await message.react("🇧");
			await message.react("🇾");
			await message.react("🇪");
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
export default departureHook;
