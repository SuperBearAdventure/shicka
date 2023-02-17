import type {Emoji} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {emoji} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Emoji["help"]) => string>;
type NoPrivacyReplyLocalizations = Localized<(groups: Emoji["noPrivacyReply"]) => string>;
type EmojiCompilation = {
	help: HelpLocalizations,
	noPrivacyReply: NoPrivacyReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Emoji["help"]>(emoji["help"]);
const noPrivacyReplyLocalizations: NoPrivacyReplyLocalizations = compileAll<Emoji["noPrivacyReply"]>(emoji["noPrivacyReply"]);
const emojiCompilation: EmojiCompilation = {
	help: helpLocalizations,
	noPrivacyReply: noPrivacyReplyLocalizations,
};
export default emojiCompilation;
