type HelpGroups = {
	approveSubCommandMention: string,
	refuseSubCommandMention: string,
	channelOptionDescription: string,
	messageOptionDescription: string,
};
type NoChannelReplyGroups = {};
type NoMessageReplyGroups = {};
type GateDependency = {
	help: HelpGroups,
	noChannelReply: NoChannelReplyGroups,
	noMessageReply: NoMessageReplyGroups,
};
export type {GateDependency as default};
