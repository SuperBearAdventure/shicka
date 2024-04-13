import type {Hyperlink} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {hyperlink} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpWithChannelsLocalizations = Localized<(groups: Hyperlink["helpWithChannels"]) => string>;
type HelpWithoutChannelsLocalizations = Localized<(groups: Hyperlink["helpWithoutChannels"]) => string>;
type HyperlinkCompilation = {
	helpWithChannels: HelpWithChannelsLocalizations,
	helpWithoutChannels: HelpWithoutChannelsLocalizations,
};
const helpWithChannelsLocalizations: HelpWithChannelsLocalizations = compileAll<Hyperlink["helpWithChannels"]>(hyperlink["helpWithChannels"]);
const helpWithoutChannelsLocalizations: HelpWithoutChannelsLocalizations = compileAll<Hyperlink["helpWithoutChannels"]>(hyperlink["helpWithoutChannels"]);
const hyperlinkCompilation: HyperlinkCompilation = {
	helpWithChannels: helpWithChannelsLocalizations,
	helpWithoutChannels: helpWithoutChannelsLocalizations,
};
export default hyperlinkCompilation;
