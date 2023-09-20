type HelpGroups = {
	commandMention: () => string,
};
type ReplyGroups = {
	intent: () => string,
	linkList: () => string,
};
type IntentWithChannelGroups = {
	channelMention: () => string,
};
type IntentWithoutChannelGroups = {};
type LinkGroups = {
	title: () => string,
	link: () => string,
};
type TrackerDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	intentWithChannel: IntentWithChannelGroups,
	intentWithoutChannel: IntentWithoutChannelGroups,
	link: LinkGroups,
};
export type {TrackerDependency as default};
