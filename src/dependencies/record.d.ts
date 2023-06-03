type HelpWithChannelGroups = {
	channel: () => string,
};
type HelpWithoutChannelGroups = {};
type RecordDependency = {
	helpWithChannel: HelpWithChannelGroups,
	helpWithoutChannel: HelpWithoutChannelGroups,
};
export default RecordDependency;
