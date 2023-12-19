type HelpGroups = {
	commandMention: string,
	outfitOptionDescription: string,
};
type ReplyGroups = {
	outfitName: string,
	costConjunction: string,
	scheduleList: string,
};
type BareReplyGroups = {
	scheduleList: string,
};
type NoSlotReplyGroups = {
	outfitName: string,
};
type TokensCostGroups = {
	tokens: string,
};
type CoinsCostGroups = {
	coins: string,
};
type NoCostGroups = {};
type ScheduleGroups = {
	dayDateTime: string,
};
type BareScheduleGroups = {
	dayDateTime: string,
	outfitNameConjunction: string,
};
type OutfitDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	bareReply: BareReplyGroups,
	noSlotReply: NoSlotReplyGroups,
	tokensCost: TokensCostGroups,
	coinsCost: CoinsCostGroups,
	noCost: NoCostGroups,
	schedule: ScheduleGroups,
	bareSchedule: BareScheduleGroups,
};
export type {OutfitDependency as default};
