import type {Patching} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {posting} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpWithChannelLocalizations = Localized<(groups: Patching["helpWithChannel"]) => string>;
type HelpWithoutChannelLocalizations = Localized<(groups: Patching["helpWithoutChannel"]) => string>;
type PatchingCompilation = {
	helpWithChannel: HelpWithChannelLocalizations,
	helpWithoutChannel: HelpWithoutChannelLocalizations,
};
const helpWithChannelLocalizations: HelpWithChannelLocalizations = compileAll<Patching["helpWithChannel"]>(posting["helpWithChannel"]);
const helpWithoutChannelLocalizations: HelpWithoutChannelLocalizations = compileAll<Patching["helpWithoutChannel"]>(posting["helpWithoutChannel"]);
const postingCompilation: PatchingCompilation = {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
};
export default postingCompilation;
