import type {Attach} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {attach} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Attach["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Attach["reply"]) => string>;
type NoAuthorReplyLocalizations = Localized<(groups: Attach["noAuthorReply"]) => string>;
type NoInteractionReplyLocalizations = Localized<(groups: Attach["noInteractionReply"]) => string>;
type NoReplyReplyLocalizations = Localized<(groups: Attach["noReplyReply"]) => string>;
type TooManyAttachmentsReplyLocalizations = Localized<(groups: Attach["tooManyAttachmentsReply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Attach["noPermissionReply"]) => string>;
type StartPositionLocalizations = Localized<(groups: Attach["startPosition"]) => string>;
type InBetweenPositionLocalizations = Localized<(groups: Attach["inBetweenPosition"]) => string>;
type EndPositionLocalizations = Localized<(groups: Attach["endPosition"]) => string>;
type AttachCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	noAuthorReply: NoAuthorReplyLocalizations,
	noInteractionReply: NoInteractionReplyLocalizations,
	noReplyReply: NoReplyReplyLocalizations,
	tooManyAttachmentsReply: TooManyAttachmentsReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
	startPosition: StartPositionLocalizations,
	inBetweenPosition: InBetweenPositionLocalizations,
	endPosition: EndPositionLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Attach["help"]>(attach["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Attach["reply"]>(attach["reply"]);
const noAuthorReplyLocalizations: NoAuthorReplyLocalizations = compileAll<Attach["noAuthorReply"]>(attach["noAuthorReply"]);
const noInteractionReplyLocalizations: NoInteractionReplyLocalizations = compileAll<Attach["noInteractionReply"]>(attach["noInteractionReply"]);
const noReplyReplyLocalizations: NoReplyReplyLocalizations = compileAll<Attach["noReplyReply"]>(attach["noReplyReply"]);
const tooManyAttachmentsReplyLocalizations: TooManyAttachmentsReplyLocalizations = compileAll<Attach["tooManyAttachmentsReply"]>(attach["tooManyAttachmentsReply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Attach["noPermissionReply"]>(attach["noPermissionReply"]);
const startPositionLocalizations: StartPositionLocalizations = compileAll<Attach["startPosition"]>(attach["startPosition"]);
const inBetweenPositionLocalizations: InBetweenPositionLocalizations = compileAll<Attach["inBetweenPosition"]>(attach["inBetweenPosition"]);
const endPositionLocalizations: EndPositionLocalizations = compileAll<Attach["endPosition"]>(attach["endPosition"]);
const attachCompilation: AttachCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	noAuthorReply: noAuthorReplyLocalizations,
	noInteractionReply: noInteractionReplyLocalizations,
	noReplyReply: noReplyReplyLocalizations,
	tooManyAttachmentsReply: tooManyAttachmentsReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
	startPosition: startPositionLocalizations,
	inBetweenPosition: inBetweenPositionLocalizations,
	endPosition: endPositionLocalizations,
};
export default attachCompilation;
