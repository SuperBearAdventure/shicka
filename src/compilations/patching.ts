import type {Patching} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {patching} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpWithChannelLocalizations = Localized<(groups: Patching["helpWithChannel"]) => string>;
type HelpWithoutChannelLocalizations = Localized<(groups: Patching["helpWithoutChannel"]) => string>;
type PatchingCompilation = {
	helpWithChannel: HelpWithChannelLocalizations,
	helpWithoutChannel: HelpWithoutChannelLocalizations,
};
const helpWithChannelLocalizations: HelpWithChannelLocalizations = compileAll<Patching["helpWithChannel"]>(patching["helpWithChannel"]);
const helpWithoutChannelLocalizations: HelpWithoutChannelLocalizations = compileAll<Patching["helpWithoutChannel"]>(patching["helpWithoutChannel"]);
const patchingCompilation: PatchingCompilation = {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
};
export default patchingCompilation;
