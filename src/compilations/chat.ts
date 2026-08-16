import type {Chat} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {chat} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Chat["help"]) => string>;
type PostHelpLocalizations = Localized<(groups: Chat["postHelp"]) => string>;
type PatchHelpLocalizations = Localized<(groups: Chat["patchHelp"]) => string>;
type AttachHelpLocalizations = Localized<(groups: Chat["attachHelp"]) => string>;
type DetachHelpLocalizations = Localized<(groups: Chat["detachHelp"]) => string>;
type ReplyLocalizations = Localized<(groups: Chat["reply"]) => string>;
type NoChannelReplyLocalizations = Localized<(groups: Chat["noChannelReply"]) => string>;
type NoMessageReplyLocalizations = Localized<(groups: Chat["noMessageReply"]) => string>;
type NoContentOrAttachmentReplyLocalizations = Localized<(groups: Chat["noContentOrAttachmentReply"]) => string>;
type NoPermissionReplyLocalizations = Localized<(groups: Chat["noPermissionReply"]) => string>;
type ChatCompilation = {
	help: HelpLocalizations,
	postHelp: PostHelpLocalizations,
	patchHelp: PatchHelpLocalizations,
	attachHelp: AttachHelpLocalizations,
	detachHelp: DetachHelpLocalizations,
	reply: ReplyLocalizations,
	noChannelReply: NoChannelReplyLocalizations,
	noMessageReply: NoMessageReplyLocalizations,
	noContentOrAttachmentReply: NoContentOrAttachmentReplyLocalizations,
	noPermissionReply: NoPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Chat["help"]>(chat["help"]);
const postHelpLocalizations: PostHelpLocalizations = compileAll<Chat["postHelp"]>(chat["postHelp"]);
const patchHelpLocalizations: PatchHelpLocalizations = compileAll<Chat["patchHelp"]>(chat["patchHelp"]);
const attachHelpLocalizations: AttachHelpLocalizations = compileAll<Chat["attachHelp"]>(chat["attachHelp"]);
const detachHelpLocalizations: DetachHelpLocalizations = compileAll<Chat["detachHelp"]>(chat["detachHelp"]);
const replyLocalizations: ReplyLocalizations = compileAll<Chat["reply"]>(chat["reply"]);
const noChannelReplyLocalizations: NoChannelReplyLocalizations = compileAll<Chat["noChannelReply"]>(chat["noChannelReply"]);
const noMessageReplyLocalizations: NoMessageReplyLocalizations = compileAll<Chat["noMessageReply"]>(chat["noMessageReply"]);
const noContentOrAttachmentReplyLocalizations: NoContentOrAttachmentReplyLocalizations = compileAll<Chat["noContentOrAttachmentReply"]>(chat["noContentOrAttachmentReply"]);
const noPermissionReplyLocalizations: NoPermissionReplyLocalizations = compileAll<Chat["noPermissionReply"]>(chat["noPermissionReply"]);
const chatCompilation: ChatCompilation = {
	help: helpLocalizations,
	postHelp: postHelpLocalizations,
	patchHelp: patchHelpLocalizations,
	attachHelp: attachHelpLocalizations,
	detachHelp: detachHelpLocalizations,
	reply: replyLocalizations,
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
	noContentOrAttachmentReply: noContentOrAttachmentReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
};
export default chatCompilation;
