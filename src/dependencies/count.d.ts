type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	memberCount: () => string,
	name: () => string,
};
type CountDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
};
export type {CountDependency as default};
