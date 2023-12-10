import type {Apply} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {apply} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Apply["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Apply["reply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Apply["noPermissionReply"]) => string>;
type ApplyCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Apply["help"]>(apply["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Apply["reply"]>(apply["reply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Apply["noPermissionReply"]>(apply["noPermissionReply"]);
const applyCompilation: ApplyCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
};
export default applyCompilation;
