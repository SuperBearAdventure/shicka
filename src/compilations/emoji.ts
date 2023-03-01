import type {Emoji} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {emoji} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Emoji["help"]) => string>;
type EmojiCompilation = {
	help: HelpLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Emoji["help"]>(emoji["help"]);
const emojiCompilation: EmojiCompilation = {
	help: helpLocalizations,
};
export default emojiCompilation;
