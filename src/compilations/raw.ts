import type {Raw} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {raw} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Raw["help"]) => string>;
type RawCompilation = {
	help: HelpLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Raw["help"]>(raw["help"]);
const rawCompilation: RawCompilation = {
	help: helpLocalizations,
};
export default rawCompilation;
