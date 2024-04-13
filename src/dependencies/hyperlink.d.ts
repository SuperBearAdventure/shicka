type HelpWithChannelsGroups = {
	channelMentions: () => string,
};
type HelpWithoutChannelsGroups = {};
type HyperlinkDependency = {
	helpWithChannels: HelpWithChannelsGroups,
	helpWithoutChannels: HelpWithoutChannelsGroups,
};
export type {HyperlinkDependency as default};
