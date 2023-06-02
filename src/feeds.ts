import type {
	ChatInputCommandInteraction,
	Client,
} from "discord.js";
import type {Job} from "node-schedule";
import type {Localized} from "./utils/string.js";
import recordFeed from "./feeds/record.js";
type Feed = {
	register(client: Client): Job;
	execute(invocation: {timestamp: Date, client: Client<boolean>}): Promise<void>;
	describe(interaction: ChatInputCommandInteraction<"cached">): Localized<(groups: {}) => string> | null;
};
const record: Feed = recordFeed;
export default Feed;
export {
	record,
};
