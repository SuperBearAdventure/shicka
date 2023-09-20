type HelpWithChannelGroups = {
	channelMention: () => string,
};
type HelpWithoutChannelGroups = {};
type RecordDependency = {
	helpWithChannel: HelpWithChannelGroups,
	helpWithoutChannel: HelpWithoutChannelGroups,
};
export type {RecordDependency as default};
