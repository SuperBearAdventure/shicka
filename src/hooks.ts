import type {
	Webhook,
	WebhookCreateOptions,
} from "discord.js";
import type {Job, RecurrenceSpecDateRange} from "node-schedule";
import type {Localized} from "./utils/string.js";
import recordHook from "./hooks/record.js";
type Hook = {
	register(): {hookOptions: Omit<WebhookCreateOptions, "channel"> & {channel: string}, jobOptions: RecurrenceSpecDateRange};
	execute(invocation: {job: Job, timestamp: Date, webhooks: Webhook[]}): Promise<void>;
	describe(webhook: Webhook): Localized<(groups: {}) => string>;
};
const record: Hook = recordHook;
export type {Hook as default};
export {
	record,
};
