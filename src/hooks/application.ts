import type {
	Client,
	ClientEvents,
	Guild,
	GuildMember,
	Role,
} from "discord.js";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";
import type {Application as ApplicationCompilation} from "../compilations.js";
import type {Application as ApplicationDefinition} from "../definitions.js";
import type {Application as ApplicationDependency} from "../dependencies.js";
import type Hook from "../hooks.js";
import type {Webhook, WebhookData, WebjobInvocation} from "../hooks.js";
import type {Localized} from "../utils/string.js";
import canvas from "canvas";
import {application as applicationCompilation} from "../compilations.js";
import {application as applicationDefinition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpWithChannelGroups = ApplicationDependency["helpWithChannel"];
type WebjobEvent<K extends keyof ClientEvents> = {
	type: K,
	data: ClientEvents[K],
};
const {
	hookName,
	hookReason,
}: ApplicationDefinition = applicationDefinition;
const {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
}: ApplicationCompilation = applicationCompilation;
const {
	SHICKA_APPLICATION_DEFAULT_CHANNEL,
	SHICKA_APPROVAL_VERIFICATION_ROLE,
	SHICKA_REFUSAL_APPLICATION_ROLE,
}: NodeJS.ProcessEnv = process.env;
const {createCanvas, loadImage}: any = canvas;
const hookChannel: string = SHICKA_APPLICATION_DEFAULT_CHANNEL ?? "";
const hookApplicationRole: string = SHICKA_REFUSAL_APPLICATION_ROLE ?? "";
const hookVerificationRole: string = SHICKA_APPROVAL_VERIFICATION_ROLE ?? "";
const hookAvatar: string = await (async (): Promise<string> => {
	const url: string = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 64 64" width="256" height="256"><circle cx="16" cy="16" r="24" fill="#ccc"/><path d="M19,6L13,26" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const image: Image = await loadImage(url);
	const canvas: Canvas = createCanvas(256, 256);
	const context: CanvasRenderingContext2D = canvas.getContext("2d");
	context.drawImage(image, 0, 0, 256, 256);
	const data: string = canvas.toDataURL();
	return data;
})();
const applicationHook: Hook = {
	register(): WebhookData {
		return {
			type: "guildMemberUpdate",
			hookOptions: {
				name: hookName,
				reason: hookReason,
				channel: hookChannel,
				avatar: hookAvatar,
			},
		};
	},
	async invoke(invocation: WebjobInvocation): Promise<void> {
		if (invocation.event.type !== "guildMemberUpdate") {
			return;
		}
		const [oldMember, newMember]: ClientEvents["guildMemberUpdate"] = (invocation.event as WebjobEvent<"guildMemberUpdate">).data;
		const {guild}: GuildMember = newMember;
		const {roles}: Guild = guild;
		const applicationRole: Role | undefined = roles.cache.find((role: Role): boolean => {
			return role.name === hookApplicationRole;
		});
		if (applicationRole == null) {
			return;
		}
		const verificationRole: Role | undefined = roles.cache.find((role: Role): boolean => {
			return role.name === hookVerificationRole;
		});
		if (verificationRole == null) {
			return;
		}
		if (oldMember.roles.cache.some((role: Role): boolean => {
			return role.name === hookApplicationRole;
		}) && oldMember.roles.cache.every((role: Role): boolean => {
			return role.name !== hookVerificationRole;
		})) {
			return;
		}
		if (newMember.roles.cache.every((role: Role): boolean => {
			return role.name !== hookApplicationRole;
		})) {
			return;
		}
		if (newMember.roles.cache.some((role: Role): boolean => {
			return role.name === hookVerificationRole;
		})) {
			return;
		}
		const memberMention: string = `<@${newMember.id}>`;
		const status: string = `${memberMention} is applying.`;
		const {client, webhooks}: WebjobInvocation = invocation;
		const {user}: Client<true> = client;
		const applicationName: string = user.username;
		const applicationIcon: string = user.displayAvatarURL();
		for (const webhook of webhooks) {
			const {channel}: Webhook = webhook;
			const application: string = status;
			const title: string = "New member application in the server";
			webhook.send({
				content: application,
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
export default applicationHook;
