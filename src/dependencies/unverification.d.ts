type HelpGroups = {
	commandMention: () => string,
};
type ReplyGroups = {};
type NoMemberReplyGroups = {};
type NoPermissionReplyGroups = {};
type UnverificationDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	noMemberReply: NoMemberReplyGroups,
	noPermissionReply: NoPermissionReplyGroups,
};
export type {UnverificationDependency as default};
