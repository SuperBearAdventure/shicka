type HelpWithChannelGroups = {
	channelMention: () => string,
};
type HelpWithoutChannelGroups = {};
type PatchingDependency = {
	helpWithChannel: HelpWithChannelGroups,
	helpWithoutChannel: HelpWithoutChannelGroups,
};
export type {PatchingDependency as default};
