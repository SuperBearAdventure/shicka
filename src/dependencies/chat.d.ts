type HelpGroups = {
	postSubCommandMention: () => string,
	patchSubCommandMention: () => string,
	attachSubCommandMention: () => string,
	detachSubCommandMention: () => string,
	channelOptionDescription: () => string,
	messageOptionDescription: () => string,
};
type ReplyGroups = {};
type BareReplyGroups = {};
type NoChannelReplyGroups = {};
type NoMessageReplyGroups = {};
type NoInteractionReplyGroups = {};
type NoContentOrAttachmentReplyGroups = {};
type NoPermissionReplyGroups = {};
type ChatDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	noChannelReply: NoChannelReplyGroups,
	noMessageReply: NoMessageReplyGroups,
	noContentOrAttachmentReply: NoContentOrAttachmentReplyGroups,
	noPermissionReply: NoPermissionReplyGroups,
};
export type {ChatDependency as default};
