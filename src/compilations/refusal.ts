import type {Refusal} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {refusal} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpWithChannelLocalizations = Localized<(groups: Refusal["helpWithChannel"]) => string>;
type HelpWithoutChannelLocalizations = Localized<(groups: Refusal["helpWithoutChannel"]) => string>;
type RefusalCompilation = {
	helpWithChannel: HelpWithChannelLocalizations,
	helpWithoutChannel: HelpWithoutChannelLocalizations,
};
const helpWithChannelLocalizations: HelpWithChannelLocalizations = compileAll<Refusal["helpWithChannel"]>(refusal["helpWithChannel"]);
const helpWithoutChannelLocalizations: HelpWithoutChannelLocalizations = compileAll<Refusal["helpWithoutChannel"]>(refusal["helpWithoutChannel"]);
const refusalCompilation: RefusalCompilation = {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
};
export default refusalCompilation;
