type HelpWithChannelGroups = {
	channelMention: string,
};
type HelpWithoutChannelGroups = {};
type VerificationDependency = {
	helpWithChannel: HelpWithChannelGroups,
	helpWithoutChannel: HelpWithoutChannelGroups,
};
export type {VerificationDependency as default};
