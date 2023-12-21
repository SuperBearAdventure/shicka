type HelpGroups = {
	postSubCommandHelp: () => string,
	patchSubCommandHelp: () => string,
	attachSubCommandHelp: () => string,
	detachSubCommandHelp: () => string,
};
type PostHelpGroups = {
	postSubCommandMention: () => string,
	channelOptionDescription: () => string,
	contentOptionDescription: () => string,
};
type PatchHelpGroups = {
	patchSubCommandMention: () => string,
	channelOptionDescription: () => string,
	messageOptionDescription: () => string,
	contentOptionDescription: () => string,
};
type AttachHelpGroups = {
	attachSubCommandMention: () => string,
	channelOptionDescription: () => string,
	messageOptionDescription: () => string,
	positionOptionDescription: () => string,
	attachmentOptionDescription: () => string,
};
type DetachHelpGroups = {
	detachSubCommandMention: () => string,
	channelOptionDescription: () => string,
	messageOptionDescription: () => string,
	positionOptionDescription: () => string,
};
type PostReplyGroups = {};
type PatchReplyGroups = {};
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
	postHelp: PostHelpGroups,
	patchHelp: PatchHelpGroups,
	attachHelp: AttachHelpGroups,
	detachHelp: DetachHelpGroups,
	postReply: PostReplyGroups,
	patchReply: PatchReplyGroups,
	noChannelReply: NoChannelReplyGroups,
	noMessageReply: NoMessageReplyGroups,
	noPositionReply: NoPositionReplyGroups,
	noContentOrAttachmentReply: NoContentOrAttachmentReplyGroups,
	noInteractionReply: NoInteractionReplyGroups,
	noPatchPermissionReply: NoPatchPermissionReplyGroups,
	noPostPermissionReply: NoPostPermissionReplyGroups,
};
export type {ChatDependency as default};
