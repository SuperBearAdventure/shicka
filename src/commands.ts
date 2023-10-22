import type {
	ApplicationCommand,
	ApplicationCommandData,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
} from "discord.js";
import type {Localized} from "./utils/string.js";
import aboutCommand from "./commands/about.js";
import bearCommand from "./commands/bear.js";
import chatCommand from "./commands/chat.js";
import countCommand from "./commands/count.js";
import emojiCommand from "./commands/emoji.js";
import helpCommand from "./commands/help.js";
import leaderboardCommand from "./commands/leaderboard.js";
import missionCommand from "./commands/mission.js";
import outfitCommand from "./commands/outfit.js";
import rawCommand from "./commands/raw.js";
import roadmapCommand from "./commands/roadmap.js";
import soundtrackCommand from "./commands/soundtrack.js";
import storeCommand from "./commands/store.js";
import trackerCommand from "./commands/tracker.js";
import trailerCommand from "./commands/trailer.js";
import updateCommand from "./commands/update.js";
type ApplicationUserInteraction = AutocompleteInteraction<"cached"> | ChatInputCommandInteraction<"cached">;
type Command = {
	register(): ApplicationCommandData;
	interact(interaction: ApplicationUserInteraction): Promise<void>;
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string>;
};
const about: Command = aboutCommand;
const bear: Command = bearCommand;
const chat: Command = chatCommand;
const count: Command = countCommand;
const emoji: Command = emojiCommand;
const help: Command = helpCommand;
const leaderboard: Command = leaderboardCommand;
const mission: Command = missionCommand;
const outfit: Command = outfitCommand;
const raw: Command = rawCommand;
const roadmap: Command = roadmapCommand;
const soundtrack: Command = soundtrackCommand;
const store: Command = storeCommand;
const tracker: Command = trackerCommand;
const trailer: Command = trailerCommand;
const update: Command = updateCommand;
export type {Command as default};
export type {
	ApplicationCommand,
	ApplicationCommandData,
	ApplicationUserInteraction,
};
export {
	about,
	bear,
	chat,
	count,
	emoji,
	help,
	leaderboard,
	mission,
	outfit,
	raw,
	roadmap,
	soundtrack,
	store,
	tracker,
	trailer,
	update,
};
