type HelpGroups = {
	commandMention: () => string,
};
type ReplyGroups = {};
type NoAuthorReplyGroups = {};
type NoInteractionReplyGroups = {};
type NoReplyReplyGroups = {};
type TooFewAttachmentsReplyGroups = {};
type NoPermissionReplyGroups = {};
type DetachDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	noAuthorReply: NoAuthorReplyGroups,
	noInteractionReply: NoInteractionReplyGroups,
	noReplyReply: NoReplyReplyGroups,
	tooFewAttachmentsReply: TooFewAttachmentsReplyGroups,
	noPermissionReply: NoPermissionReplyGroups,
};
export type {DetachDependency as default};
