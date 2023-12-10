import type {Application} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {application} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpWithChannelLocalizations = Localized<(groups: Application["helpWithChannel"]) => string>;
type HelpWithoutChannelLocalizations = Localized<(groups: Application["helpWithoutChannel"]) => string>;
type ApplicationCompilation = {
	helpWithChannel: HelpWithChannelLocalizations,
	helpWithoutChannel: HelpWithoutChannelLocalizations,
};
const helpWithChannelLocalizations: HelpWithChannelLocalizations = compileAll<Application["helpWithChannel"]>(application["helpWithChannel"]);
const helpWithoutChannelLocalizations: HelpWithoutChannelLocalizations = compileAll<Application["helpWithoutChannel"]>(application["helpWithoutChannel"]);
const applicationCompilation: ApplicationCompilation = {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
};
export default applicationCompilation;
