import type {
	ApplicationCommand,
	AutocompleteInteraction,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	MessageApplicationCommandData,
	MessageContextMenuCommandInteraction,
} from "discord.js";
import type {Localized} from "./utils/string.js";
import aboutCommand from "./commands/about.js";
import applyCommand from "./commands/apply.js";
import approveCommand from "./commands/approve.js";
import bearCommand from "./commands/bear.js";
import chatCommand from "./commands/chat.js";
import countCommand from "./commands/count.js";
import emojiCommand from "./commands/emoji.js";
import gateCommand from "./commands/gate.js";
import helpCommand from "./commands/help.js";
import leaderboardCommand from "./commands/leaderboard.js";
import missionCommand from "./commands/mission.js";
import outfitCommand from "./commands/outfit.js";
import patchCommand from "./commands/patch.js";
import rawCommand from "./commands/raw.js";
import refuseCommand from "./commands/refuse.js";
import roadmapCommand from "./commands/roadmap.js";
import soundtrackCommand from "./commands/soundtrack.js";
import storeCommand from "./commands/store.js";
import trackerCommand from "./commands/tracker.js";
import trailerCommand from "./commands/trailer.js";
import updateCommand from "./commands/update.js";
import verifyCommand from "./commands/verify.js";
type ApplicationCommandData = (ChatInputApplicationCommandData | MessageApplicationCommandData) & (
	{
		default_permission?: true,
		dmPermission: false,
		global: true;
	} | {
		global?: false;
	}
);
type ApplicationUserInteraction = AutocompleteInteraction<"cached"> | ChatInputCommandInteraction<"cached"> | MessageContextMenuCommandInteraction<"cached">;
type Command = {
	register(): ApplicationCommandData;
	interact(interaction: ApplicationUserInteraction): Promise<void>;
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string>;
};
const about: Command = aboutCommand;
const apply: Command = applyCommand;
const approve: Command = approveCommand;
const bear: Command = bearCommand;
const chat: Command = chatCommand;
const count: Command = countCommand;
const emoji: Command = emojiCommand;
const gate: Command = gateCommand;
const help: Command = helpCommand;
const leaderboard: Command = leaderboardCommand;
const mission: Command = missionCommand;
const outfit: Command = outfitCommand;
const patch: Command = patchCommand;
const raw: Command = rawCommand;
const refuse: Command = refuseCommand;
const roadmap: Command = roadmapCommand;
const soundtrack: Command = soundtrackCommand;
const store: Command = storeCommand;
const tracker: Command = trackerCommand;
const trailer: Command = trailerCommand;
const update: Command = updateCommand;
const verify: Command = verifyCommand;
export type {Command as default};
export type {
	ApplicationCommand,
	ApplicationCommandData,
	ApplicationUserInteraction,
};
export {
	about,
	apply,
	approve,
	bear,
	chat,
	count,
	emoji,
	gate,
	help,
	leaderboard,
	mission,
	outfit,
	patch,
	raw,
	refuse,
	roadmap,
	soundtrack,
	store,
	tracker,
	trailer,
	update,
	verify,
};
