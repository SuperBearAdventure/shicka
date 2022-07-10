import type {Client, CommandInteraction} from "discord.js";
import type {Job} from "node-schedule";
import recordFeed from "./feeds/record.js";
type Feed = {
	register(client: Client): Job;
	execute(start: number, end: number): Promise<string[]>;
	describe(interaction: CommandInteraction): string | null;
};
export default Feed;
const record: Feed = recordFeed;
export {
	record,
};
