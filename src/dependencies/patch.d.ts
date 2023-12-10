type HelpGroups = {
	commandMention: () => string,
};
type ReplyGroups = {};
type NoContentOrAttachmentReplyGroups = {};
type NoInteractionReplyGroups = {};
type NoPermissionReplyGroups = {};
type PatchDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	noContentOrAttachmentReply: NoContentOrAttachmentReplyGroups,
	noInteractionReply: NoInteractionReplyGroups,
	noPermissionReply: NoPermissionReplyGroups,
};
export type {PatchDependency as default};
