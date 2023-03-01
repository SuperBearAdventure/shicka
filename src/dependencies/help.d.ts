type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	member: () => string,
	featureList: () => string,
};
type HelpDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
};
export default HelpDependency;
