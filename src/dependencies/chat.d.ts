type HelpGroups = {
	postSubCommandHelp: () => string,
	patchSubCommandHelp: () => string,
	attachSubCommandHelp: () => string,
	detachSubCommandHelp: () => string,
};
type PostHelpGroups = {
	postSubCommandMention: () => string,
	channelOptionDescription: () => string,
};
type PatchHelpGroups = {
	patchSubCommandMention: () => string,
	channelOptionDescription: () => string,
	messageOptionDescription: () => string,
};
type AttachHelpGroups = {
	attachSubCommandMention: () => string,
	channelOptionDescription: () => string,
	messageOptionDescription: () => string,
};
type DetachHelpGroups = {
	detachSubCommandMention: () => string,
	channelOptionDescription: () => string,
	messageOptionDescription: () => string,
};
type PostReplyGroups = {};
type PatchReplyGroups = {};
type NoChannelReplyGroups = {};
type NoMessageReplyGroups = {};
type NoInteractionReplyGroups = {};
type NoContentOrAttachmentReplyGroups = {};
type NoPermissionReplyGroups = {};
type ChatDependency = {
	help: HelpGroups,
	postHelp: PostHelpGroups,
	patchHelp: PatchHelpGroups,
	attachHelp: AttachHelpGroups,
	detachHelp: DetachHelpGroups,
	reply: ReplyGroups,
	noChannelReply: NoChannelReplyGroups,
	noMessageReply: NoMessageReplyGroups,
	noContentOrAttachmentReply: NoContentOrAttachmentReplyGroups,
	noPermissionReply: NoPermissionReplyGroups,
};
export type {ChatDependency as default};
