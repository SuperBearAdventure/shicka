type HelpWithChannelsGroups = {
	channels: () => string,
};
type HelpWithoutChannelsGroups = {};
type Rule7Dependency = {
	helpWithChannels: HelpWithChannelsGroups,
	helpWithoutChannels: HelpWithoutChannelsGroups,
};
export type {Rule7Dependency as default};
