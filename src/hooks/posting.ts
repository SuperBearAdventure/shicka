import type {
	Client,
	ClientEvents,
	Message,
} from "discord.js";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";
import type {Posting as PostingCompilation} from "../compilations.js";
import type {Posting as PostingDefinition} from "../definitions.js";
import type {Posting as PostingDependency} from "../dependencies.js";
import type Hook from "../hooks.js";
import type {Webhook, WebhookData, WebjobInvocation} from "../hooks.js";
import type {Localized} from "../utils/string.js";
import {
	MessageType,
} from "discord.js";
import canvas from "canvas";
import {posting as postingCompilation} from "../compilations.js";
import {posting as postingDefinition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpWithChannelGroups = PostingDependency["helpWithChannel"];
type WebjobEvent<K extends keyof ClientEvents> = {
	type: K,
	data: ClientEvents[K],
};
const {
	hookName,
	hookReason,
}: PostingDefinition = postingDefinition;
const {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
}: PostingCompilation = postingCompilation;
const {
	SHICKA_POSTING_DEFAULT_CHANNEL,
}: NodeJS.ProcessEnv = process.env;
const {createCanvas, loadImage}: any = canvas;
const hookChannel: string = SHICKA_POSTING_DEFAULT_CHANNEL ?? "";
const hookAvatar: string = await (async (): Promise<string> => {
	const url: string = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 64 64" width="256" height="256"><circle cx="16" cy="16" r="24" fill="#ccc"/><path d="M6,20L24,6L23,24L17,20L14,26L13,19ZM13,19L24,6M17,20L24,6" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const image: Image = await loadImage(url);
	const canvas: Canvas = createCanvas(256, 256);
	const context: CanvasRenderingContext2D = canvas.getContext("2d");
	context.drawImage(image, 0, 0, 256, 256);
	const data: string = canvas.toDataURL();
	return data;
})();
const postingHook: Hook = {
	register(): WebhookData {
		return {
			type: "messageCreate",
			hookOptions: {
				name: hookName,
				reason: hookReason,
				channel: hookChannel,
				avatar: hookAvatar,
			},
		};
	},
	async invoke(invocation: WebjobInvocation): Promise<void> {
		if (invocation.event.type !== "messageCreate") {
			return;
		}
		const [message]: ClientEvents["messageCreate"] = (invocation.event as WebjobEvent<"messageCreate">).data;
		if (!message.inGuild()) {
			return;
		}
		const {author}: Message<true> = message;
		const {client, webhooks}: WebjobInvocation = invocation;
		const {user}: Client<true> = client;
		if (author.id !== user.id) {
			return;
		}
		if (message.interaction != null) {
			return;
		}
		if (message.type !== MessageType.Default) {
			return;
		}
		const messageMention: string = `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`;
		const status: string = `${messageMention} has been sent.`;
		const applicationName: string = user.username;
		const applicationIcon: string = user.displayAvatarURL();
		for (const webhook of webhooks) {
			const {channel}: Webhook = webhook;
			const posting: string = status;
			const title: string = "New message post on the server";
			await webhook.send({
				content: posting,
				username: applicationName,
				avatarURL: applicationIcon,
				...(channel != null && channel.isThreadOnly() ? {threadName: title} : {}),
				allowedMentions: {
					parse: [],
				},
			});
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
export default postingHook;
