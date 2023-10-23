import type {
	Client,
	Webhook,
	WebhookCreateOptions,
} from "discord.js";
import type {Job, RecurrenceSpecDateRange} from "node-schedule";
import type {Localized} from "./utils/string.js";
import recordHook from "./hooks/record.js";
type WebhookData = {
	hookOptions: Omit<WebhookCreateOptions, "channel"> & {
		channel: string,
	},
	jobOptions: RecurrenceSpecDateRange,
};
type WebjobInvocation = {
	job: Job,
	timestamp: Date,
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
