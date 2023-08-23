type HelpGroups = {
	commandName: () => string,
	postSubCommandName: () => string,
	patchSubCommandName: () => string,
	attachSubCommandName: () => string,
	detachSubCommandName: () => string,
	channelOptionDescription: () => string,
	messageOptionDescription: () => string,
	contentOptionDescription: () => string,
	positionOptionDescription: () => string,
	attachmentOptionDescription: () => string,
};
type ReplyGroups = {};
type BareReplyGroups = {};
type NoChannelReplyGroups = {};
type NoMessageReplyGroups = {};
type NoPositionReplyGroups = {
	max: () => string,
};
type NoContentOrAttachmentReplyGroups = {};
type NoInteractionReplyGroups = {};
type NoPatchPermissionReplyGroups = {};
type NoPostPermissionReplyGroups = {};
type ChatDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	bareReply: BareReplyGroups,
	noChannelReply: NoChannelReplyGroups,
	noMessageReply: NoMessageReplyGroups,
	noPositionReply: NoPositionReplyGroups,
	noContentOrAttachmentReply: NoContentOrAttachmentReplyGroups,
	noInteractionReply: NoInteractionReplyGroups,
	noPatchPermissionReply: NoPatchPermissionReplyGroups,
	noPostPermissionReply: NoPostPermissionReplyGroups,
};
export type {ChatDependency as default};
