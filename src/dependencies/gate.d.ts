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
// type ApproveReplyGroups = {};
// type RefuseReplyGroups = {};
type NoChannelReplyGroups = {};
type NoMessageReplyGroups = {};
// type NoApprovePermissionReplyGroups = {};
// type NoRefusePermissionReplyGroups = {};
type GateDependency = {
	help: HelpGroups,
	approveHelp: ApproveHelpGroups,
	refuseHelp: RefuseHelpGroups,
	// approveReply: ApproveReplyGroups,
	// refuseReply: RefuseReplyGroups,
	noChannelReply: NoChannelReplyGroups,
	noMessageReply: NoMessageReplyGroups,
	// noApprovePermissionReply: NoApprovePermissionReplyGroups,
	// noRefusePermissionReply: NoRefusePermissionReplyGroups,
};
export type {GateDependency as default};
