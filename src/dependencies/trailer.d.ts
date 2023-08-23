type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	linkList: () => string,
};
type DefaultReplyGroups = {
	link: () => string,
};
type LinkGroups = {
	title: () => string,
	link: () => string,
	views: () => string,
};
type TrailerDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	defaultReply: DefaultReplyGroups,
	link: LinkGroups,
};
export type {TrailerDependency as default};
