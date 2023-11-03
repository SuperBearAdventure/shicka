import type {Verification} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {verification} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Verification["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Verification["reply"]) => string>;
type NoMemberReplyLocalizations = Localized<(groups: Verification["noMemberReply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Verification["noPermissionReply"]) => string>;
type VerificationCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	noMemberReply: NoMemberReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Verification["help"]>(verification["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Verification["reply"]>(verification["reply"]);
const noMemberReplyLocalizations: NoMemberReplyLocalizations = compileAll<Verification["noMemberReply"]>(verification["noMemberReply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Verification["noPermissionReply"]>(verification["noPermissionReply"]);
const verificationCompilation: VerificationCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	noMemberReply: noMemberReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
};
export default verificationCompilation;
