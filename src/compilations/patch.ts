import type {Patch} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {patch} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Patch["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Patch["reply"]) => string>;
type NoAuthorReplyLocalizations = Localized<(groups: Patch["noAuthorReply"]) => string>;
type NoInteractionReplyLocalizations = Localized<(groups: Patch["noInteractionReply"]) => string>;
type NoReplyReplyLocalizations = Localized<(groups: Patch["noReplyReply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Patch["noPermissionReply"]) => string>;
type PatchCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	noAuthorReply: NoAuthorReplyLocalizations,
	noInteractionReply: NoInteractionReplyLocalizations,
	noReplyReply: NoReplyReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Patch["help"]>(patch["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Patch["reply"]>(patch["reply"]);
const noAuthorReplyLocalizations: NoAuthorReplyLocalizations = compileAll<Patch["noAuthorReply"]>(patch["noAuthorReply"]);
const noInteractionReplyLocalizations: NoInteractionReplyLocalizations = compileAll<Patch["noInteractionReply"]>(patch["noInteractionReply"]);
const noReplyReplyLocalizations: NoReplyReplyLocalizations = compileAll<Patch["noReplyReply"]>(patch["noReplyReply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Patch["noPermissionReply"]>(patch["noPermissionReply"]);
const patchCompilation: PatchCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	noAuthorReply: noAuthorReplyLocalizations,
	noInteractionReply: noInteractionReplyLocalizations,
	noReplyReply: noReplyReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
};
export default patchCompilation;
