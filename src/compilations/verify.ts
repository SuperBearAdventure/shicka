import type {Verify} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {verify} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Verify["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Verify["reply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Verify["noPermissionReply"]) => string>;
type VerifyCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Verify["help"]>(verify["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Verify["reply"]>(verify["reply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Verify["noPermissionReply"]>(verify["noPermissionReply"]);
const verifyCompilation: VerifyCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
};
export default verifyCompilation;
