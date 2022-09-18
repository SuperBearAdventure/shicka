import type {Client, CommandInteraction} from "discord.js";
import type {Job} from "node-schedule";
import type {Localized} from "./utils/string.js";
import recordFeed from "./feeds/record.js";
type Feed = {
	register(client: Client): Job;
	execute(start: number, end: number): Promise<string[]>;
	describe(interaction: CommandInteraction): Localized<() => string>;
};
export default Feed;
const record: Feed = recordFeed;
export {
	record,
};
