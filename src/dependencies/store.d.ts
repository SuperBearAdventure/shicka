type HelpGroups = {
	commandMention: () => string,
};
type ReplyGroups = {
	linkList: () => string,
};
type LinkGroups = {
	title: () => string,
	link: () => string,
};
type StoreDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	link: LinkGroups,
};
export type {StoreDependency as default};
