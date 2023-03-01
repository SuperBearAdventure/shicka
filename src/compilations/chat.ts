import type {Chat} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {chat} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Chat["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Chat["reply"]) => string>;
type BareReplyLocalizations = Localized<(groups: Chat["bareReply"]) => string>;
type NoChannelReplyLocalizations = Localized<(groups: Chat["noChannelReply"]) => string>;
type NoMessageReplyLocalizations = Localized<(groups: Chat["noMessageReply"]) => string>;
type NoPositionReplyLocalizations = Localized<(groups: Chat["noPositionReply"]) => string>;
type NoContentOrAttachmentReplyLocalizations = Localized<(groups: Chat["noContentOrAttachmentReply"]) => string>;
type NoInteractionReplyLocalizations = Localized<(groups: Chat["noInteractionReply"]) => string>;
type NoPatchPermissionReplyLocalizations = Localized<(groups: Chat["noPatchPermissionReply"]) => string>;
type NoPostPermissionReplyLocalizations = Localized<(groups: Chat["noPostPermissionReply"]) => string>;
type ChatCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	bareReply: BareReplyLocalizations,
	noChannelReply: NoChannelReplyLocalizations,
	noMessageReply: NoMessageReplyLocalizations,
	noPositionReply: NoPositionReplyLocalizations,
	noContentOrAttachmentReply: NoContentOrAttachmentReplyLocalizations,
	noInteractionReply: NoInteractionReplyLocalizations,
	noPatchPermissionReply: NoPatchPermissionReplyLocalizations,
	noPostPermissionReply: NoPostPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Chat["help"]>(chat["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Chat["reply"]>(chat["reply"]);
const bareReplyLocalizations: BareReplyLocalizations = compileAll<Chat["bareReply"]>(chat["bareReply"]);
const noChannelReplyLocalizations: NoChannelReplyLocalizations = compileAll<Chat["noChannelReply"]>(chat["noChannelReply"]);
const noMessageReplyLocalizations: NoMessageReplyLocalizations = compileAll<Chat["noMessageReply"]>(chat["noMessageReply"]);
const noPositionReplyLocalizations: NoPositionReplyLocalizations = compileAll<Chat["noPositionReply"]>(chat["noPositionReply"]);
const noInteractionReplyLocalizations: NoInteractionReplyLocalizations = compileAll<Chat["noInteractionReply"]>(chat["noInteractionReply"]);
const noContentOrAttachmentReplyLocalizations: NoContentOrAttachmentReplyLocalizations = compileAll<Chat["noContentOrAttachmentReply"]>(chat["noContentOrAttachmentReply"]);
const noPatchPermissionReplyLocalizations: NoPatchPermissionReplyLocalizations = compileAll<Chat["noPatchPermissionReply"]>(chat["noPatchPermissionReply"]);
const noPostPermissionReplyLocalizations: NoPostPermissionReplyLocalizations = compileAll<Chat["noPostPermissionReply"]>(chat["noPostPermissionReply"]);
const chatCompilation: ChatCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	bareReply: bareReplyLocalizations,
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
	noPositionReply: noPositionReplyLocalizations,
	noContentOrAttachmentReply: noContentOrAttachmentReplyLocalizations,
	noInteractionReply: noInteractionReplyLocalizations,
	noPatchPermissionReply: noPatchPermissionReplyLocalizations,
	noPostPermissionReply: noPostPermissionReplyLocalizations,
};
export default chatCompilation;
