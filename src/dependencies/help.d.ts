type HelpGroups = {
	commandMention: () => string,
	featureOptionDescription: () => string,
};
type ReplyGroups = {
	memberMention: () => string,
	featureList: () => string,
};
type BareReplyGroups = {
	memberMention: () => string,
	featureList: () => string,
};
type NoFeatureReplyGroups = {
	memberMention: () => string,
};
type HelpDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	bareReply: BareReplyGroups,
	noFeatureReply: NoFeatureReplyGroups,
};
export type {HelpDependency as default};
