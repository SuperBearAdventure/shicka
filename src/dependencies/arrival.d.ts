type HelpWithChannelGroups = {
	channelMention: () => string,
};
type HelpWithoutChannelGroups = {};
type GreetingGroups = {
	memberMention: () => string,
};
type ArrivalDependency = {
	helpWithChannel: HelpWithChannelGroups,
	helpWithoutChannel: HelpWithoutChannelGroups,
	greetings: GreetingGroups[],
};
export type {ArrivalDependency as default};
