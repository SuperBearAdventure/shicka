type HelpWithChannelGroups = {
	channelMention: () => string,
};
type HelpWithoutChannelGroups = {};
type RefusalDependency = {
	helpWithChannel: HelpWithChannelGroups,
	helpWithoutChannel: HelpWithoutChannelGroups,
};
export type {RefusalDependency as default};
