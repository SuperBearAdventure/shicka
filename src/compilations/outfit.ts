import type {Outfit} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {outfit} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Outfit["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Outfit["reply"]) => string>;
type BareReplyLocalizations = Localized<(groups: Outfit["bareReply"]) => string>;
type NoSlotReplyLocalizations = Localized<(groups: Outfit["noSlotReply"]) => string>;
type TokensCostLocalizations = Localized<(groups: Outfit["tokensCost"]) => string>;
type CoinsCostLocalizations = Localized<(groups: Outfit["coinsCost"]) => string>;
type NoCostLocalizations = Localized<(groups: Outfit["noCost"]) => string>;
type ScheduleLocalizations = Localized<(groups: Outfit["schedule"]) => string>;
type BareScheduleLocalizations = Localized<(groups: Outfit["bareSchedule"]) => string>;
type OutfitCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	bareReply: BareReplyLocalizations,
	noSlotReply: NoSlotReplyLocalizations,
	tokensCost: TokensCostLocalizations,
	coinsCost: CoinsCostLocalizations,
	noCost: NoCostLocalizations,
	schedule: ScheduleLocalizations,
	bareSchedule: BareScheduleLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Outfit["help"]>(outfit["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Outfit["reply"]>(outfit["reply"]);
const bareReplyLocalizations: BareReplyLocalizations = compileAll<Outfit["bareReply"]>(outfit["bareReply"]);
const noSlotReplyLocalizations: NoSlotReplyLocalizations = compileAll<Outfit["noSlotReply"]>(outfit["noSlotReply"]);
const tokensCostLocalizations: TokensCostLocalizations = compileAll<Outfit["tokensCost"]>(outfit["tokensCost"]);
const coinsCostLocalizations: CoinsCostLocalizations = compileAll<Outfit["coinsCost"]>(outfit["coinsCost"]);
const noCostLocalizations: NoCostLocalizations = compileAll<Outfit["noCost"]>(outfit["noCost"]);
const scheduleLocalizations: ScheduleLocalizations = compileAll<Outfit["schedule"]>(outfit["schedule"]);
const bareScheduleLocalizations: BareScheduleLocalizations = compileAll<Outfit["bareSchedule"]>(outfit["bareSchedule"]);
const outfitCompilation: OutfitCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	bareReply: bareReplyLocalizations,
	noSlotReply: noSlotReplyLocalizations,
	tokensCost: tokensCostLocalizations,
	coinsCost: coinsCostLocalizations,
	noCost: noCostLocalizations,
	schedule: scheduleLocalizations,
	bareSchedule: bareScheduleLocalizations,
};
export default outfitCompilation;
