type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	user: () => string,
	featureList: () => string,
};
type HelpDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
};
export default HelpDependency;
