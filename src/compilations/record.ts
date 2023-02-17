import type {Record} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {record} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Record["help"]) => string>;
type RecordCompilation = {
	help: HelpLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Record["help"]>(record["help"]);
const recordCompilation: RecordCompilation = {
	help: helpLocalizations,
};
export default recordCompilation;
