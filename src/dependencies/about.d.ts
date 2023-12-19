type HelpGroups = {
	commandMention: string,
};
type ReplyGroups = {
	bot: string,
	author: string,
	link: string,
};
type AboutDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
};
export type {AboutDependency as default};
