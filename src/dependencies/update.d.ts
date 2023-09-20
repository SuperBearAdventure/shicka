type HelpGroups = {
	commandMention: () => string,
};
type ReplyGroups = {
	linkList: () => string,
};
type DefaultReplyGroups = {
	linkList: () => string,
};
type LinkGroups = {
	title: () => string,
	link: () => string,
	version: () => string,
	date: () => string,
};
type UpdateDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	defaultReply: DefaultReplyGroups,
	link: LinkGroups,
};
export type {UpdateDependency as default};
