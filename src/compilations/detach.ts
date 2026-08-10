import type {Detach} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {detach} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Detach["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Detach["reply"]) => string>;
type NoAuthorReplyLocalizations = Localized<(groups: Detach["noAuthorReply"]) => string>;
type NoInteractionReplyLocalizations = Localized<(groups: Detach["noInteractionReply"]) => string>;
type NoReplyReplyLocalizations = Localized<(groups: Detach["noReplyReply"]) => string>;
type TooFewAttachmentsReplyLocalizations = Localized<(groups: Detach["tooFewAttachmentsReply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Detach["noPermissionReply"]) => string>;
type DetachCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	noAuthorReply: NoAuthorReplyLocalizations,
	noInteractionReply: NoInteractionReplyLocalizations,
	noReplyReply: NoReplyReplyLocalizations,
	tooFewAttachmentsReply: TooFewAttachmentsReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Detach["help"]>(detach["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Detach["reply"]>(detach["reply"]);
const noAuthorReplyLocalizations: NoAuthorReplyLocalizations = compileAll<Detach["noAuthorReply"]>(detach["noAuthorReply"]);
const noInteractionReplyLocalizations: NoInteractionReplyLocalizations = compileAll<Detach["noInteractionReply"]>(detach["noInteractionReply"]);
const noReplyReplyLocalizations: NoReplyReplyLocalizations = compileAll<Detach["noReplyReply"]>(detach["noReplyReply"]);
const tooFewAttachmentsReplyLocalizations: TooFewAttachmentsReplyLocalizations = compileAll<Detach["tooFewAttachmentsReply"]>(detach["tooFewAttachmentsReply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Detach["noPermissionReply"]>(detach["noPermissionReply"]);
const detachCompilation: DetachCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	noAuthorReply: noAuthorReplyLocalizations,
	noInteractionReply: noInteractionReplyLocalizations,
	noReplyReply: noReplyReplyLocalizations,
	tooFewAttachmentsReply: tooFewAttachmentsReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
};
export default detachCompilation;
