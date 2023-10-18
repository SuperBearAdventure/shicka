import type {Approval} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {approval} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpWithChannelLocalizations = Localized<(groups: Approval["helpWithChannel"]) => string>;
type HelpWithoutChannelLocalizations = Localized<(groups: Approval["helpWithoutChannel"]) => string>;
type ApprovalCompilation = {
	helpWithChannel: HelpWithChannelLocalizations,
	helpWithoutChannel: HelpWithoutChannelLocalizations,
};
const helpWithChannelLocalizations: HelpWithChannelLocalizations = compileAll<Approval["helpWithChannel"]>(approval["helpWithChannel"]);
const helpWithoutChannelLocalizations: HelpWithoutChannelLocalizations = compileAll<Approval["helpWithoutChannel"]>(approval["helpWithoutChannel"]);
const approvalCompilation: ApprovalCompilation = {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
};
export default approvalCompilation;
