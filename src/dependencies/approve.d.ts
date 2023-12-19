type HelpGroups = {
	commandMention: string,
};
type ReplyGroups = {};
type NoMemberReplyGroups = {};
type NoPermissionReplyGroups = {};
type ApproveDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	noMemberReply: NoMemberReplyGroups,
	noPermissionReply: NoPermissionReplyGroups,
};
export type {ApproveDependency as default};
