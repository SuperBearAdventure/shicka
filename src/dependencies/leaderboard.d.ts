type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	linkList: () => string,
};
type LinkGroups = {
	title: () => string,
	link: () => string,
};
type LeaderboardDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	link: LinkGroups,
};
export type {LeaderboardDependency as default};
