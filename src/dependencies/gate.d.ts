type HelpGroups = {
	approveSubCommandHelp: () => string,
	refuseSubCommandHelp: () => string,
};
type ApproveHelpGroups = {
	approveSubCommandMention: () => string,
	channelOptionDescription: () => string,
	messageOptionDescription: () => string,
};
type RefuseHelpGroups = {
	refuseSubCommandMention: () => string,
	channelOptionDescription: () => string,
	messageOptionDescription: () => string,
};
type NoChannelReplyGroups = {};
type NoMessageReplyGroups = {};
type GateDependency = {
	help: HelpGroups,
	approveHelp: ApproveHelpGroups,
	refuseHelp: RefuseHelpGroups,
	noChannelReply: NoChannelReplyGroups,
	noMessageReply: NoMessageReplyGroups,
};
export type {GateDependency as default};
