import type {
	Client,
	ClientEvents,
	Message,
} from "discord.js";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";
import type {Patching as PatchingCompilation} from "../compilations.js";
import type {Patching as PatchingDefinition} from "../definitions.js";
import type {Patching as PatchingDependency} from "../dependencies.js";
import type Hook from "../hooks.js";
import type {Webhook, WebhookData, WebjobInvocation} from "../hooks.js";
import type {Localized} from "../utils/string.js";
import {
	MessageType,
} from "discord.js";
import canvas from "canvas";
import {patching as patchingCompilation} from "../compilations.js";
import {patching as patchingDefinition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpWithChannelGroups = PatchingDependency["helpWithChannel"];
type WebjobEvent<K extends keyof ClientEvents> = {
	type: K,
	data: ClientEvents[K],
};
const {
	hookName,
	hookReason,
}: PatchingDefinition = patchingDefinition;
const {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
}: PatchingCompilation = patchingCompilation;
const {
	SHICKA_PATCHING_DEFAULT_CHANNEL,
}: NodeJS.ProcessEnv = process.env;
const {createCanvas, loadImage}: any = canvas;
const hookChannel: string = SHICKA_PATCHING_DEFAULT_CHANNEL ?? "";
const hookAvatar: string = await (async (): Promise<string> => {
	const url: string = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 64 64" width="256" height="256"><circle cx="16" cy="16" r="24" fill="#ccc"/><path d="M6,26L6,20L20,6L26,12L12,26ZM8,18L14,24M16,10L22,16M11,21L19,13" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const image: Image = await loadImage(url);
	const canvas: Canvas = createCanvas(256, 256);
	const context: CanvasRenderingContext2D = canvas.getContext("2d");
	context.drawImage(image, 0, 0, 256, 256);
	const data: string = canvas.toDataURL();
	return data;
})();
const patchingHook: Hook = {
	register(): WebhookData {
		return {
			type: "messageUpdate",
			hookOptions: {
				name: hookName,
				reason: hookReason,
				channel: hookChannel,
				avatar: hookAvatar,
			},
		};
	},
	async invoke(invocation: WebjobInvocation): Promise<void> {
		if (invocation.event.type !== "messageUpdate") {
			return;
		}
		const [oldMessage, newMessage]: ClientEvents["messageUpdate"] = (invocation.event as WebjobEvent<"messageUpdate">).data;
		if (oldMessage.partial || newMessage.partial) {
			return;
		}
		if (!newMessage.inGuild()) {
			return;
		}
		const {author}: Message<true> = newMessage;
		const {client, webhooks}: WebjobInvocation = invocation;
		const {user}: Client<true> = client;
		if (author.id !== user.id) {
			return;
		}
		if (newMessage.interaction != null) {
			return;
		}
		if (newMessage.type !== MessageType.Default) {
			return;
		}
		const messageMention: string = `https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`;
		const status: string = `${messageMention} has been edited.`;
		const applicationName: string = user.username;
		const applicationIcon: string = user.displayAvatarURL();
		for (const webhook of webhooks) {
			const {channel}: Webhook = webhook;
			const patching: string = status;
			const title: string = "New message patch on the server";
			const message: Message<boolean> = await webhook.send({
				content: patching,
				username: applicationName,
				avatarURL: applicationIcon,
				...(channel != null && channel.isThreadOnly() ? {threadName: title} : {}),
				allowedMentions: {
					parse: [],
				},
			});
			const replyMessage: Message<boolean> = await message.reply({
				content: "Here is the old message:",
			});
			await replyMessage.reply({
				content: oldMessage.content,
				files: [...oldMessage.attachments.values()],
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
export default patchingHook;
