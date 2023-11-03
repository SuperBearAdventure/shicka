type HelpGroups = {
	commandMention: () => string,
};
type ReplyGroups = {};
type NoMemberReplyGroups = {};
type NoPermissionReplyGroups = {};
type VerificationDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	noMemberReply: NoMemberReplyGroups,
	noPermissionReply: NoPermissionReplyGroups,
};
export type {VerificationDependency as default};
