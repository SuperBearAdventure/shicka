type HelpWithChannelGroups = {
	channelMention: () => string,
};
type HelpWithoutChannelGroups = {};
type ApplicationDependency = {
	helpWithChannel: HelpWithChannelGroups,
	helpWithoutChannel: HelpWithoutChannelGroups,
};
export type {ApplicationDependency as default};
