type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	intent: () => string,
	link: () => string,
};
type IntentWithChannelGroups = {
	channel: () => string,
};
type IntentWithoutChannelGroups = {};
type RoadmapDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	intentWithChannel: IntentWithChannelGroups,
	intentWithoutChannel: IntentWithoutChannelGroups,
};
export default RoadmapDependency;
