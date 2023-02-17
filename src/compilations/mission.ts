import type {Mission} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {mission} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Mission["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Mission["reply"]) => string>;
type BareReplyLocalizations = Localized<(groups: Mission["bareReply"]) => string>;
type MissionNameLocalizations = Localized<(groups: Mission["missionName"]) => string>;
type ScheduleLocalizations = Localized<(groups: Mission["schedule"]) => string>;
type BareScheduleLocalizations = Localized<(groups: Mission["bareSchedule"]) => string>;
type MissionCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	bareReply: BareReplyLocalizations,
	missionName: MissionNameLocalizations,
	schedule: ScheduleLocalizations,
	bareSchedule: BareScheduleLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Mission["help"]>(mission["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Mission["reply"]>(mission["reply"]);
const bareReplyLocalizations: BareReplyLocalizations = compileAll<Mission["bareReply"]>(mission["bareReply"]);
const missionNameLocalizations: MissionNameLocalizations = compileAll<Mission["missionName"]>(mission["missionName"]);
const scheduleLocalizations: ScheduleLocalizations = compileAll<Mission["schedule"]>(mission["schedule"]);
const bareScheduleLocalizations: BareScheduleLocalizations = compileAll<Mission["bareSchedule"]>(mission["bareSchedule"]);
const missionCompilation: MissionCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	bareReply: bareReplyLocalizations,
	missionName: missionNameLocalizations,
	schedule: scheduleLocalizations,
	bareSchedule: bareScheduleLocalizations,
};
export default missionCompilation;
