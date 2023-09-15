type HelpGroups = {
	commandMention: string,
};
type ReplyGroups = {
	intent: string,
	link: string,
};
type IntentWithChannelGroups = {
	channelMention: string,
};
type IntentWithoutChannelGroups = {};
type RoadmapDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	intentWithChannel: IntentWithChannelGroups,
	intentWithoutChannel: IntentWithoutChannelGroups,
};
export type {RoadmapDependency as default};
