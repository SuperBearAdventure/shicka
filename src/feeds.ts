import type {
	ChatInputCommandInteraction,
	Client,
} from "discord.js";
import type {Job} from "node-schedule";
import type {Localized} from "./utils/string.js";
import recordFeed from "./feeds/record.js";
type Feed = {
	register(client: Client): Job;
	execute(start: number, end: number): Promise<string[]>;
	describe(interaction: ChatInputCommandInteraction<"cached">): Localized<(groups: {}) => string> | null;
};
export default Feed;
const record: Feed = recordFeed;
export {
	record,
};
