import type {
	ChatInputCommandInteraction,
	Webhook,
	WebhookCreateOptions,
} from "discord.js";
import type {Job, RecurrenceSpecDateRange} from "node-schedule";
import type {Localized} from "./utils/string.js";
import recordHook from "./hooks/record.js";
type Hook = {
	register(): {hookOptions: Omit<WebhookCreateOptions, "channel"> & {channel: string}, jobOptions: RecurrenceSpecDateRange};
	execute(invocation: {job: Job, timestamp: Date, webhooks: Webhook[]}): Promise<void>;
	describe(interaction: ChatInputCommandInteraction<"cached">): Localized<(groups: {}) => string> | null;
};
const record: Hook = recordHook;
export default Hook;
export {
	record,
};
