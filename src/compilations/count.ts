import type {Count} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {count} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Count["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Count["reply"]) => string>;
type CountCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Count["help"]>(count["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Count["reply"]>(count["reply"]);
const countCompilation: CountCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
};
export default countCompilation;
