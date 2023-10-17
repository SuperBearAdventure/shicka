import type {Chat} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {chat} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Chat["help"]) => string>;
type PostHelpLocalizations = Localized<(groups: Chat["postHelp"]) => string>;
type PatchHelpLocalizations = Localized<(groups: Chat["patchHelp"]) => string>;
type AttachHelpLocalizations = Localized<(groups: Chat["attachHelp"]) => string>;
type DetachHelpLocalizations = Localized<(groups: Chat["detachHelp"]) => string>;
type PostReplyLocalizations = Localized<(groups: Chat["postReply"]) => string>;
type PatchReplyLocalizations = Localized<(groups: Chat["patchReply"]) => string>;
type NoChannelReplyLocalizations = Localized<(groups: Chat["noChannelReply"]) => string>;
type NoMessageReplyLocalizations = Localized<(groups: Chat["noMessageReply"]) => string>;
type NoPositionReplyLocalizations = Localized<(groups: Chat["noPositionReply"]) => string>;
type NoContentOrAttachmentReplyLocalizations = Localized<(groups: Chat["noContentOrAttachmentReply"]) => string>;
type NoInteractionReplyLocalizations = Localized<(groups: Chat["noInteractionReply"]) => string>;
type NoPatchPermissionReplyLocalizations = Localized<(groups: Chat["noPatchPermissionReply"]) => string>;
type NoPostPermissionReplyLocalizations = Localized<(groups: Chat["noPostPermissionReply"]) => string>;
type ChatCompilation = {
	help: HelpLocalizations,
	postHelp: PostHelpLocalizations,
	patchHelp: PatchHelpLocalizations,
	attachHelp: AttachHelpLocalizations,
	detachHelp: DetachHelpLocalizations,
	postReply: PostReplyLocalizations,
	patchReply: PatchReplyLocalizations,
	noChannelReply: NoChannelReplyLocalizations,
	noMessageReply: NoMessageReplyLocalizations,
	noPositionReply: NoPositionReplyLocalizations,
	noContentOrAttachmentReply: NoContentOrAttachmentReplyLocalizations,
	noInteractionReply: NoInteractionReplyLocalizations,
	noPatchPermissionReply: NoPatchPermissionReplyLocalizations,
	noPostPermissionReply: NoPostPermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Chat["help"]>(chat["help"]);
const postHelpLocalizations: PostHelpLocalizations = compileAll<Chat["postHelp"]>(chat["postHelp"]);
const patchHelpLocalizations: PatchHelpLocalizations = compileAll<Chat["patchHelp"]>(chat["patchHelp"]);
const attachHelpLocalizations: AttachHelpLocalizations = compileAll<Chat["attachHelp"]>(chat["attachHelp"]);
const detachHelpLocalizations: DetachHelpLocalizations = compileAll<Chat["detachHelp"]>(chat["detachHelp"]);
const postReplyLocalizations: PostReplyLocalizations = compileAll<Chat["postReply"]>(chat["postReply"]);
const patchReplyLocalizations: PatchReplyLocalizations = compileAll<Chat["patchReply"]>(chat["patchReply"]);
const noChannelReplyLocalizations: NoChannelReplyLocalizations = compileAll<Chat["noChannelReply"]>(chat["noChannelReply"]);
const noMessageReplyLocalizations: NoMessageReplyLocalizations = compileAll<Chat["noMessageReply"]>(chat["noMessageReply"]);
const noPositionReplyLocalizations: NoPositionReplyLocalizations = compileAll<Chat["noPositionReply"]>(chat["noPositionReply"]);
const noInteractionReplyLocalizations: NoInteractionReplyLocalizations = compileAll<Chat["noInteractionReply"]>(chat["noInteractionReply"]);
const noContentOrAttachmentReplyLocalizations: NoContentOrAttachmentReplyLocalizations = compileAll<Chat["noContentOrAttachmentReply"]>(chat["noContentOrAttachmentReply"]);
const noPatchPermissionReplyLocalizations: NoPatchPermissionReplyLocalizations = compileAll<Chat["noPatchPermissionReply"]>(chat["noPatchPermissionReply"]);
const noPostPermissionReplyLocalizations: NoPostPermissionReplyLocalizations = compileAll<Chat["noPostPermissionReply"]>(chat["noPostPermissionReply"]);
const chatCompilation: ChatCompilation = {
	help: helpLocalizations,
	postHelp: postHelpLocalizations,
	patchHelp: patchHelpLocalizations,
	attachHelp: attachHelpLocalizations,
	detachHelp: detachHelpLocalizations,
	postReply: postReplyLocalizations,
	patchReply: patchReplyLocalizations,
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
	noPositionReply: noPositionReplyLocalizations,
	noContentOrAttachmentReply: noContentOrAttachmentReplyLocalizations,
	noInteractionReply: noInteractionReplyLocalizations,
	noPatchPermissionReply: noPatchPermissionReplyLocalizations,
	noPostPermissionReply: noPostPermissionReplyLocalizations,
};
export default chatCompilation;
