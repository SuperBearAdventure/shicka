import type {Refuse} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {refuse} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Refuse["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Refuse["reply"]) => string>;
type NoMemberReplyLocalizations = Localized<(groups: Refuse["noMemberReply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Refuse["noPermissionReply"]) => string>;
type RefuseCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	noMemberReply: NoMemberReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Refuse["help"]>(refuse["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Refuse["reply"]>(refuse["reply"]);
const noMemberReplyLocalizations: NoMemberReplyLocalizations = compileAll<Refuse["noMemberReply"]>(refuse["noMemberReply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Refuse["noPermissionReply"]>(refuse["noPermissionReply"]);
const refuseCompilation: RefuseCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	noMemberReply: noMemberReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
};
export default refuseCompilation;
