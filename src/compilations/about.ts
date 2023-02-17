import type {About} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {about} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: About["help"]) => string>;
type ReplyLocalizations = Localized<(groups: About["reply"]) => string>;
type AboutCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<About["help"]>(about["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<About["reply"]>(about["reply"]);
const aboutCompilation: AboutCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
};
export default aboutCompilation;
