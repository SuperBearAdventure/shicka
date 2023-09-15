type HelpGroups = {
	commandMention: string,
};
type ReplyGroups = {};
type NoMemberReplyGroups = {};
type NoPermissionReplyGroups = {};
type RefuseDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	noMemberReply: NoMemberReplyGroups,
	noPermissionReply: NoPermissionReplyGroups,
};
export type {RefuseDependency as default};
