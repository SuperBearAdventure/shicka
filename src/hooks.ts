import type {
	Client,
	ClientEvents,
	Webhook,
	WebhookCreateOptions,
} from "discord.js";
import type {Job, RecurrenceSpecDateRange} from "node-schedule";
import type {Localized} from "./utils/string.js";
import applicationHook from "./hooks/application.js";
import arrivalHook from "./hooks/arrival.js";
import approvalHook from "./hooks/approval.js";
import departureHook from "./hooks/departure.js";
import patchingHook from "./hooks/patching.js";
import postingHook from "./hooks/posting.js";
import refusalHook from "./hooks/refusal.js";
import recordHook from "./hooks/record.js";
import verificationHook from "./hooks/verification.js";
type WebhookData = (
	{
		type: keyof ClientEvents,
	} | {
		type: "cronWebjobInvocation",
		jobOptions: RecurrenceSpecDateRange,
	}
) & {
	hookOptions: Omit<WebhookCreateOptions, "channel"> & {
		channel: string,
	}
};
type WebjobEvent<K extends keyof ClientEvents> = {
	type: K,
	data: ClientEvents[K],
};
type WebjobInvocation = (
	{
		job: {
			name: string,
		},
		event: WebjobEvent<keyof ClientEvents>,
	} | {
		job: Job,
		event: {
			type: "cronWebjobInvocation",
			data: [timestamp: Date],
		},
	}
) & {
	client: Client<true>,
	webhooks: Webhook[],
};
type Hook = {
	register(): WebhookData;
	invoke(invocation: WebjobInvocation): Promise<void>;
	describe(webhook: Webhook): Localized<(groups: {}) => string>;
};
const application: Hook = applicationHook;
const arrival: Hook = arrivalHook;
const approval: Hook = approvalHook;
const departure: Hook = departureHook;
const patching: Hook = patchingHook;
const posting: Hook = postingHook;
const record: Hook = recordHook;
const refusal: Hook = refusalHook;
const verification: Hook = verificationHook;
export type {Hook as default};
export type {
	Webhook,
	WebhookData,
	WebjobInvocation,
};
export {
	application,
	approval,
	arrival,
	departure,
	patching,
	posting,
	record,
	refusal,
	verification,
};
