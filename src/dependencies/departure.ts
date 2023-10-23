type HelpWithChannelGroups = {
	channelMention: () => string,
};
type HelpWithoutChannelGroups = {};
type GreetingGroups = {
	memberMention: () => string,
};
type DepartureDependency = {
	helpWithChannel: HelpWithChannelGroups,
	helpWithoutChannel: HelpWithoutChannelGroups,
	greetings: GreetingGroups[],
};
export type {DepartureDependency as default};
