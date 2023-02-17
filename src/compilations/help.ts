import type {Help} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {help} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Help["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Help["reply"]) => string>;
type HelpCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Help["help"]>(help["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Help["reply"]>(help["reply"]);
const helpCompilation: HelpCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
};
export default helpCompilation;
