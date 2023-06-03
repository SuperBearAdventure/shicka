import type {Rule7} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {rule7} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpWithChannelsLocalizations = Localized<(groups: Rule7["helpWithChannels"]) => string>;
type HelpWithoutChannelsLocalizations = Localized<(groups: Rule7["helpWithoutChannels"]) => string>;
type Rule7Compilation = {
	helpWithChannels: HelpWithChannelsLocalizations,
	helpWithoutChannels: HelpWithoutChannelsLocalizations,
};
const helpWithChannelsLocalizations: HelpWithChannelsLocalizations = compileAll<Rule7["helpWithChannels"]>(rule7["helpWithChannels"]);
const helpWithoutChannelsLocalizations: HelpWithoutChannelsLocalizations = compileAll<Rule7["helpWithoutChannels"]>(rule7["helpWithoutChannels"]);
const rule7Compilation: Rule7Compilation = {
	helpWithChannels: helpWithChannelsLocalizations,
	helpWithoutChannels: helpWithoutChannelsLocalizations,
};
export default rule7Compilation;
