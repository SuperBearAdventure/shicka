type HelpGroups = {
	commandMention: () => string,
};
type ReplyGroups = {
	memberMention: () => string,
	featureList: () => string,
};
type HelpDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
};
export type {HelpDependency as default};
