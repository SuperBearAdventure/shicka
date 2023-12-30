type HelpGroups = {
	postSubCommandMention: () => string,
	patchSubCommandMention: () => string,
	attachSubCommandMention: () => string,
	detachSubCommandMention: () => string,
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
	noAuthorReply: NoAuthorReplyGroups,
	noInteractionReply: NoInteractionReplyGroups,
	noReplyReply: NoReplyReplyGroups,
	noPatchPermissionReply: NoPatchPermissionReplyGroups,
	noPostPermissionReply: NoPostPermissionReplyGroups,
};
export type {ChatDependency as default};
