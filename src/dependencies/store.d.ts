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
type StoreDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	link: LinkGroups,
};
export default StoreDependency;
