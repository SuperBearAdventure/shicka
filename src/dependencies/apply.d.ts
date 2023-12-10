type HelpGroups = {
	commandMention: () => string,
};
type ReplyGroups = {};
type NoPermissionReplyGroups = {};
type ApplyDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	noPermissionReply: NoPermissionReplyGroups,
};
export type {ApplyDependency as default};
