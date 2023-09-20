type HelpGroups = {
	commandMention: () => string,
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
type SoundtrackDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	defaultReply: DefaultReplyGroups,
	link: LinkGroups,
};
export type {SoundtrackDependency as default};
