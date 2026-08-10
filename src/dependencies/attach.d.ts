type HelpGroups = {
	commandMention: () => string,
};
type ReplyGroups = {};
type NoAuthorReplyGroups = {};
type NoInteractionReplyGroups = {};
type NoReplyReplyGroups = {};
type TooManyAttachmentsReplyGroups = {};
type NoPermissionReplyGroups = {};
type StartPositionGroups = {};
type InBetweenPositionGroups = {
	previousAttachmentMention: () => string,
	nextAttachmentMention: () => string,
};
type EndPositionGroups = {};
type AttachDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	noAuthorReply: NoAuthorReplyGroups,
	noInteractionReply: NoInteractionReplyGroups,
	noReplyReply: NoReplyReplyGroups,
	tooManyAttachmentsReply: TooManyAttachmentsReplyGroups,
	noPermissionReply: NoPermissionReplyGroups,
	startPosition: StartPositionGroups,
	inBetweenPosition: InBetweenPositionGroups,
	endPosition: EndPositionGroups,
};
export type {AttachDependency as default};
