type HelpGroups = {
	commandMention: () => string,
	bearOptionDescription: () => string,
};
type ReplyGroups = {
	name: () => string,
	level: () => string,
	outfitNameConjunction: () => string,
	goalConjunction: () => string,
};
type VariableOutfitGroups = {
	outfit: () => string,
	variation: () => string,
};
type InvariableOutfitGroups = {
	outfit: () => string,
};
type NoOutfitGroups = {};
type BossGoalGroups = {
	boss: () => string,
};
type CoinsGoalGroups = {
	coins: () => string,
};
type TimeGoalGroups = {
	time: () => string,
};
type NoGoalGroups = {};
type BearDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	variableOutfit: VariableOutfitGroups,
	invariableOutfit: InvariableOutfitGroups,
	noOutfit: NoOutfitGroups,
	bossGoal: BossGoalGroups,
	coinsGoal: CoinsGoalGroups,
	timeGoal: TimeGoalGroups,
	noGoal: NoGoalGroups,
};
export type {BearDependency as default};
