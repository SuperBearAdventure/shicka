import type {Unverification} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {unverification} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Unverification["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Unverification["reply"]) => string>;
type NoMemberReplyLocalizations = Localized<(groups: Unverification["noMemberReply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Unverification["noPermissionReply"]) => string>;
type UnverificationCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	noMemberReply: NoMemberReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Unverification["help"]>(unverification["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Unverification["reply"]>(unverification["reply"]);
const noMemberReplyLocalizations: NoMemberReplyLocalizations = compileAll<Unverification["noMemberReply"]>(unverification["noMemberReply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Unverification["noPermissionReply"]>(unverification["noPermissionReply"]);
const unverificationCompilation: UnverificationCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	noMemberReply: noMemberReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
};
export default unverificationCompilation;
