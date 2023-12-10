import type {Patch} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {patch} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Patch["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Patch["reply"]) => string>;
type NoContentOrAttachmentReplyLocalizations = Localized<(groups: Patch["noContentOrAttachmentReply"]) => string>;
type NoInteractionReplyLocalizations = Localized<(groups: Patch["noInteractionReply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Patch["noPermissionReply"]) => string>;
type PatchCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	noContentOrAttachmentReply: NoContentOrAttachmentReplyLocalizations,
	noInteractionReply: NoInteractionReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Patch["help"]>(patch["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Patch["reply"]>(patch["reply"]);
const noContentOrAttachmentReplyLocalizations: NoContentOrAttachmentReplyLocalizations = compileAll<Patch["noContentOrAttachmentReply"]>(patch["noContentOrAttachmentReply"]);
const noInteractionReplyLocalizations: NoInteractionReplyLocalizations = compileAll<Patch["noInteractionReply"]>(patch["noInteractionReply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Patch["noPermissionReply"]>(patch["noPermissionReply"]);
const patchCompilation: PatchCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	noContentOrAttachmentReply: noContentOrAttachmentReplyLocalizations,
	noInteractionReply: noInteractionReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
};
export default patchCompilation;
