type HelpGroups = {
	commandMention: string,
};
type ReplyGroups = {
	name: string,
};
type NoPermissionReplyGroups = {};
type VerifyDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	noPermissionReply: NoPermissionReplyGroups,
};
export type {VerifyDependency as default};
