import type {Leaderboard} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {leaderboard} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Leaderboard["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Leaderboard["reply"]) => string>;
type LinkLocalizations = Localized<(groups: Leaderboard["link"]) => string>;
type LeaderboardCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	link: LinkLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Leaderboard["help"]>(leaderboard["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Leaderboard["reply"]>(leaderboard["reply"]);
const linkLocalizations: LinkLocalizations = compileAll<Leaderboard["link"]>(leaderboard["link"]);
const leaderboardCompilation: LeaderboardCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	link: linkLocalizations,
};
export default leaderboardCompilation;
