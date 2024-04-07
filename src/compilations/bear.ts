import type {Bear} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {bear} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Bear["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Bear["reply"]) => string>;
type VariableOutfitLocalizations = Localized<(groups: Bear["variableOutfit"]) => string>;
type InvariableOutfitLocalizations = Localized<(groups: Bear["invariableOutfit"]) => string>;
type NoOutfitLocalizations = Localized<(groups: Bear["noOutfit"]) => string>;
type BossGoalLocalizations = Localized<(groups: Bear["bossGoal"]) => string>;
type CoinsGoalLocalizations = Localized<(groups: Bear["coinsGoal"]) => string>;
type TimeGoalLocalizations = Localized<(groups: Bear["timeGoal"]) => string>;
type NoGoalLocalizations = Localized<(groups: Bear["noGoal"]) => string>;
type BearCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	variableOutfit: VariableOutfitLocalizations,
	invariableOutfit: InvariableOutfitLocalizations,
	noOutfit: NoOutfitLocalizations,
	bossGoal: BossGoalLocalizations,
	coinsWithBossGoal: CoinsGoalLocalizations,
	coinsWithoutBossGoal: CoinsGoalLocalizations,
	timeWithBossOrCoinsGoal: TimeGoalLocalizations,
	timeWithoutBossAndCoinsGoal: TimeGoalLocalizations,
	noGoal: NoGoalLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Bear["help"]>(bear["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Bear["reply"]>(bear["reply"]);
const variableOutfitLocalizations: VariableOutfitLocalizations = compileAll<Bear["variableOutfit"]>(bear["variableOutfit"]);
const invariableOutfitLocalizations: InvariableOutfitLocalizations = compileAll<Bear["invariableOutfit"]>(bear["invariableOutfit"]);
const noOutfitLocalizations: NoOutfitLocalizations = compileAll<Bear["noOutfit"]>(bear["noOutfit"]);
const bossGoalLocalizations: BossGoalLocalizations = compileAll<Bear["bossGoal"]>(bear["bossGoal"]);
const coinsWithBossGoalLocalizations:  CoinsGoalLocalizations = compileAll<Bear["coinsGoal"]>(bear["coinsWithBossGoal"]);
const coinsWithoutBossGoalLocalizations:  CoinsGoalLocalizations = compileAll<Bear["coinsGoal"]>(bear["coinsWithoutBossGoal"]);
const timeWithBossOrCoinsGoalLocalizations: TimeGoalLocalizations = compileAll<Bear["timeGoal"]>(bear["timeWithBossOrCoinsGoal"]);
const timeWithoutBossAndCoinsGoalLocalizations: TimeGoalLocalizations = compileAll<Bear["timeGoal"]>(bear["timeWithoutBossAndCoinsGoal"]);
const noGoalLocalizations: NoGoalLocalizations = compileAll<Bear["noGoal"]>(bear["noGoal"]);
const bearCompilation: BearCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	variableOutfit: variableOutfitLocalizations,
	invariableOutfit: invariableOutfitLocalizations,
	noOutfit: noOutfitLocalizations,
	bossGoal: bossGoalLocalizations,
	coinsWithBossGoal: coinsWithBossGoalLocalizations,
	coinsWithoutBossGoal: coinsWithoutBossGoalLocalizations,
	timeWithBossOrCoinsGoal: timeWithBossOrCoinsGoalLocalizations,
	timeWithoutBossAndCoinsGoal: timeWithoutBossAndCoinsGoalLocalizations,
	noGoal: noGoalLocalizations,
};
export default bearCompilation;
