import type {Verification} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {verification} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpWithChannelLocalizations = Localized<(groups: Verification["helpWithChannel"]) => string>;
type HelpWithoutChannelLocalizations = Localized<(groups: Verification["helpWithoutChannel"]) => string>;
type VerificationCompilation = {
	helpWithChannel: HelpWithChannelLocalizations,
	helpWithoutChannel: HelpWithoutChannelLocalizations,
};
const helpWithChannelLocalizations: HelpWithChannelLocalizations = compileAll<Verification["helpWithChannel"]>(verification["helpWithChannel"]);
const helpWithoutChannelLocalizations: HelpWithoutChannelLocalizations = compileAll<Verification["helpWithoutChannel"]>(verification["helpWithoutChannel"]);
const verificationCompilation: VerificationCompilation = {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
};
export default verificationCompilation;
