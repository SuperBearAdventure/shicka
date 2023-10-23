import type {
	Client,
	ClientEvents,
	Webhook,
	WebhookCreateOptions,
} from "discord.js";
import type {Job, RecurrenceSpecDateRange} from "node-schedule";
import type {Localized} from "./utils/string.js";
import recordHook from "./hooks/record.js";
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
const record: Hook = recordHook;
export type {Hook as default};
export type {
	Webhook,
	WebhookData,
	WebjobInvocation,
};
export {
	record,
};
