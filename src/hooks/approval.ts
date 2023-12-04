import type {
	Client,
	ClientEvents,
	Guild,
	GuildMember,
	Message,
	Role,
} from "discord.js";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";
import type {Approval as ApprovalCompilation} from "../compilations.js";
import type {Approval as ApprovalDefinition} from "../definitions.js";
import type {Approval as ApprovalDependency} from "../dependencies.js";
import type Hook from "../hooks.js";
import type {Webhook, WebhookData, WebjobInvocation} from "../hooks.js";
import type {Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import canvas from "canvas";
import {approval as approvalCompilation} from "../compilations.js";
import {approval as approvalDefinition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpWithChannelGroups = ApprovalDependency["helpWithChannel"];
type WebjobEvent<K extends keyof ClientEvents> = {
	type: K,
	data: ClientEvents[K],
};
const {
	hookName,
	hookReason,
}: ApprovalDefinition = approvalDefinition;
const {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
}: ApprovalCompilation = approvalCompilation;
const {
	SHICKA_APPROVAL_DEFAULT_CHANNEL,
	SHICKA_APPLICATION_APPLYING_ROLE,
	SHICKA_VERIFICATION_VERIFIED_ROLE,
}: NodeJS.ProcessEnv = process.env;
const {createCanvas, loadImage}: any = canvas;
const hookChannel: string = SHICKA_APPROVAL_DEFAULT_CHANNEL ?? "";
const hookApplyingRole: string = SHICKA_APPLICATION_APPLYING_ROLE ?? "";
const hookVerifiedRole: string = SHICKA_VERIFICATION_VERIFIED_ROLE ?? "";
const hookAvatar: string = await (async (): Promise<string> => {
	const url: string = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 64 64" width="256" height="256"><circle cx="16" cy="16" r="24" fill="#ccc"/><path d="M6,17L12,23L26,9" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const image: Image = await loadImage(url);
	const canvas: Canvas = createCanvas(256, 256);
	const context: CanvasRenderingContext2D = canvas.getContext("2d");
	context.drawImage(image, 0, 0, 256, 256);
	const data: string = canvas.toDataURL();
	return data;
})();
const approvalHook: Hook = {
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
		const {name, roles}: Guild = guild;
		const applyingRole: Role | null = roles.cache.find((role: Role): boolean => {
			return role.name === hookApplyingRole;
		}) ?? null;
		if (applyingRole == null) {
			return;
		}
		const verifiedRole: Role | null = roles.cache.find((role: Role): boolean => {
			return role.name === hookVerifiedRole;
		}) ?? null;
		if (verifiedRole == null) {
			return;
		}
		if (oldMember.roles.cache.every((role: Role): boolean => {
			return role.name !== hookApplyingRole;
		}) && oldMember.roles.cache.some((role: Role): boolean => {
			return role.name === hookVerifiedRole;
		})) {
			return;
		}
		if (newMember.roles.cache.some((role: Role): boolean => {
			return role.name === hookApplyingRole;
		})) {
			return;
		}
		if (newMember.roles.cache.every((role: Role): boolean => {
			return role.name !== hookVerifiedRole;
		})) {
			return;
		}
		const memberMention: string = `<@${newMember.id}>`;
		const greeting: string = `${memberMention} has been approved.`;
		const {client, webhooks}: WebjobInvocation = invocation;
		const {user}: Client<true> = client;
		const applicationName: string = user.username;
		const applicationIcon: string = user.displayAvatarURL();
		for (const webhook of webhooks) {
			const {channel}: Webhook = webhook;
			const approval: string = greeting;
			const welcome: string = "New member approval in the server";
			const message: Message<boolean> = await webhook.send({
				content: approval,
				username: applicationName,
				avatarURL: applicationIcon,
				...(channel != null && channel.isThreadOnly() ? {threadName: welcome} : {}),
				allowedMentions: {
					parse: [],
				},
			});
			await message.react("🇭");
			await message.react("🇪");
			await message.react("🇾");
			await message.react("👋");
		}
		const content: string = `You managed to get verified in the official *${escapeMarkdown(name)}* *Discord* server!\nYou should now be able to interact with the community.\nSee you there!`;
		await newMember.send({content});
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
export default approvalHook;
