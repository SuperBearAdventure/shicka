import type {Chat} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {chat} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Chat["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Chat["reply"]) => string>;
type NoChannelReplyLocalizations = Localized<(groups: Chat["noChannelReply"]) => string>;
type NoMessageReplyLocalizations = Localized<(groups: Chat["noMessageReply"]) => string>;
type NoContentOrAttachmentReplyLocalizations = Localized<(groups: Chat["noContentOrAttachmentReply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Chat["noPermissionReply"]) => string>;
type ChatCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	noChannelReply: NoChannelReplyLocalizations,
	noMessageReply: NoMessageReplyLocalizations,
	noContentOrAttachmentReply: NoContentOrAttachmentReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Chat["help"]>(chat["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Chat["reply"]>(chat["reply"]);
const noChannelReplyLocalizations: NoChannelReplyLocalizations = compileAll<Chat["noChannelReply"]>(chat["noChannelReply"]);
const noMessageReplyLocalizations: NoMessageReplyLocalizations = compileAll<Chat["noMessageReply"]>(chat["noMessageReply"]);
const noContentOrAttachmentReplyLocalizations: NoContentOrAttachmentReplyLocalizations = compileAll<Chat["noContentOrAttachmentReply"]>(chat["noContentOrAttachmentReply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Chat["noPermissionReply"]>(chat["noPermissionReply"]);
const chatCompilation: ChatCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
	noContentOrAttachmentReply: noContentOrAttachmentReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
};
export default chatCompilation;
