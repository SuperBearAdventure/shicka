import type {Rule7} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {rule7} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Rule7["help"]) => string>;
type Rule7Compilation = {
	help: HelpLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Rule7["help"]>(rule7["help"]);
const rule7Compilation: Rule7Compilation = {
	help: helpLocalizations,
};
export default rule7Compilation;
