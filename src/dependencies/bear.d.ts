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
	noOutfit: NoOutfitGroups,
	bossGoal: BossGoalGroups,
	coinsGoal: CoinsGoalGroups,
	timeGoal: TimeGoalGroups,
	noGoal: NoGoalGroups,
};
export type {BearDependency as default};
