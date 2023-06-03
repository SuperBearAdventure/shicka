import type {Record} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {record} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpWithChannelLocalizations = Localized<(groups: Record["helpWithChannel"]) => string>;
type HelpWithoutChannelLocalizations = Localized<(groups: Record["helpWithoutChannel"]) => string>;
type RecordCompilation = {
	helpWithChannel: HelpWithChannelLocalizations,
	helpWithoutChannel: HelpWithoutChannelLocalizations,
};
const helpWithChannelLocalizations: HelpWithChannelLocalizations = compileAll<Record["helpWithChannel"]>(record["helpWithChannel"]);
const helpWithoutChannelLocalizations: HelpWithoutChannelLocalizations = compileAll<Record["helpWithoutChannel"]>(record["helpWithoutChannel"]);
const recordCompilation: RecordCompilation = {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
};
export default recordCompilation;
