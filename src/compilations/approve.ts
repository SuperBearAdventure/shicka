import type {Approve} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {approve} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Approve["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Approve["reply"]) => string>;
type NoMemberReplyLocalizations = Localized<(groups: Approve["noMemberReply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Approve["noPermissionReply"]) => string>;
type ApproveCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	noMemberReply: NoMemberReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Approve["help"]>(approve["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Approve["reply"]>(approve["reply"]);
const noMemberReplyLocalizations: NoMemberReplyLocalizations = compileAll<Approve["noMemberReply"]>(approve["noMemberReply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Approve["noPermissionReply"]>(approve["noPermissionReply"]);
const approveCompilation: ApproveCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	noMemberReply: noMemberReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
};
export default approveCompilation;
