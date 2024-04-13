import type {Link} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {link} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpWithChannelsLocalizations = Localized<(groups: Link["helpWithChannels"]) => string>;
type HelpWithoutChannelsLocalizations = Localized<(groups: Link["helpWithoutChannels"]) => string>;
type LinkCompilation = {
	helpWithChannels: HelpWithChannelsLocalizations,
	helpWithoutChannels: HelpWithoutChannelsLocalizations,
};
const helpWithChannelsLocalizations: HelpWithChannelsLocalizations = compileAll<Link["helpWithChannels"]>(link["helpWithChannels"]);
const helpWithoutChannelsLocalizations: HelpWithoutChannelsLocalizations = compileAll<Link["helpWithoutChannels"]>(link["helpWithoutChannels"]);
const linkCompilation: LinkCompilation = {
	helpWithChannels: helpWithChannelsLocalizations,
	helpWithoutChannels: helpWithoutChannelsLocalizations,
};
export default linkCompilation;
