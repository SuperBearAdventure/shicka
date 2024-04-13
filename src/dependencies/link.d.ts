type HelpWithChannelsGroups = {
	channelMentions: () => string,
};
type HelpWithoutChannelsGroups = {};
type LinkDependency = {
	helpWithChannels: HelpWithChannelsGroups,
	helpWithoutChannels: HelpWithoutChannelsGroups,
};
export type {LinkDependency as default};
