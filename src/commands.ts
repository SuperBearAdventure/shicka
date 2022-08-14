import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import aboutCommand from "./commands/about.js";
import bearCommand from "./commands/bear.js";
import countCommand from "./commands/count.js";
import helpCommand from "./commands/help.js";
import leaderboardCommand from "./commands/leaderboard.js";
import missionCommand from "./commands/mission.js";
import outfitCommand from "./commands/outfit.js";
import rawCommand from "./commands/raw.js";
import roadmapCommand from "./commands/roadmap.js";
import storeCommand from "./commands/store.js";
import trackerCommand from "./commands/tracker.js";
import trailerCommand from "./commands/trailer.js";
import updateCommand from "./commands/update.js";
type Command = {
	register(): ApplicationCommandData;
	execute(interaction: Interaction): Promise<void>;
	describe(interaction: CommandInteraction): {[k in string]: () => string};
};
const about: Command = aboutCommand;
const bear: Command = bearCommand;
const count: Command = countCommand;
const help: Command = helpCommand;
const leaderboard: Command = leaderboardCommand;
const mission: Command = missionCommand;
const outfit: Command = outfitCommand;
const raw: Command = rawCommand;
const roadmap: Command = roadmapCommand;
const store: Command = storeCommand;
const tracker: Command = trackerCommand;
const trailer: Command = trailerCommand;
const update: Command = updateCommand;
export default Command;
export {
	about,
	bear,
	count,
	help,
	leaderboard,
	mission,
	outfit,
	raw,
	roadmap,
	store,
	tracker,
	trailer,
	update,
};
