import type {
	Client,
	ClientEvents,
	Guild,
	GuildMember,
	Role,
} from "discord.js";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";
import type {Verification as VerificationCompilation} from "../compilations.js";
import type {Verification as VerificationDefinition} from "../definitions.js";
import type {Verification as VerificationDependency} from "../dependencies.js";
import type Hook from "../hooks.js";
import type {Webhook, WebhookData, WebjobInvocation} from "../hooks.js";
import type {Localized} from "../utils/string.js";
import canvas from "canvas";
import {verification as verificationCompilation} from "../compilations.js";
import {verification as verificationDefinition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpWithChannelGroups = VerificationDependency["helpWithChannel"];
type WebjobEvent<K extends keyof ClientEvents> = {
	type: K,
	data: ClientEvents[K],
};
const {
	hookName,
	hookReason,
}: VerificationDefinition = verificationDefinition;
const {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
}: VerificationCompilation = verificationCompilation;
const {
	SHICKA_APPROVAL_VERIFICATION_ROLE,
	SHICKA_REFUSAL_APPLICATION_ROLE,
	SHICKA_VERIFICATION_DEFAULT_CHANNEL,
}: NodeJS.ProcessEnv = process.env;
const {createCanvas, loadImage}: any = canvas;
const hookChannel: string = SHICKA_VERIFICATION_DEFAULT_CHANNEL ?? "";
const hookApplicationRole: string = SHICKA_REFUSAL_APPLICATION_ROLE ?? "";
const hookVerificationRole: string = SHICKA_APPROVAL_VERIFICATION_ROLE ?? "";
const hookAvatar: string = await (async (): Promise<string> => {
	const url: string = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 64 64" width="256" height="256"><circle cx="16" cy="16" r="24" fill="#ccc"/><path d="M16,6L16,26M6,16L26,16M9,9L23,23M9,23L23,9" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const image: Image = await loadImage(url);
	const canvas: Canvas = createCanvas(256, 256);
	const context: CanvasRenderingContext2D = canvas.getContext("2d");
	context.drawImage(image, 0, 0, 256, 256);
	const data: string = canvas.toDataURL();
	return data;
})();
const verificationHook: Hook = {
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
		const verificationRole: Role | undefined = roles.cache.find((role: Role): boolean => {
			return role.name === hookVerificationRole;
		});
		if (verificationRole == null) {
			return;
		}
		if ((applicationRole == null || oldMember.roles.cache.every((role: Role): boolean => {
			return role.name !== hookApplicationRole;
		})) && oldMember.roles.cache.some((role: Role): boolean => {
			return role.name === hookVerificationRole;
		})) {
			return;
		}
		if (applicationRole != null && newMember.roles.cache.some((role: Role): boolean => {
			return role.name === hookApplicationRole;
		})) {
			return;
		}
		if (newMember.roles.cache.every((role: Role): boolean => {
			return role.name !== hookVerificationRole;
		})) {
			return;
		}
		const memberMention: string = `<@${newMember.id}>`;
		const status: string = `${memberMention} has been verified.`;
		const {client, webhooks}: WebjobInvocation = invocation;
		const {user}: Client<true> = client;
		const applicationName: string = user.username;
		const applicationIcon: string = user.displayAvatarURL();
		for (const webhook of webhooks) {
			const {channel}: Webhook = webhook;
			const verification: string = status;
			const title: string = "New member verification in the server";
			await webhook.send({
				content: verification,
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
export default verificationHook;
