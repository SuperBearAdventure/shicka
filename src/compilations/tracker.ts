
import type {Tracker} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {tracker} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Tracker["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Tracker["reply"]) => string>;
type IntentWithChannelLocalizations = Localized<(groups: Tracker["intentWithChannel"]) => string>;
type IntentWithoutChannelLocalizations = Localized<(groups: Tracker["intentWithoutChannel"]) => string>;
type LinkLocalizations = Localized<(groups: Tracker["link"]) => string>;
type TrackerCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	intentWithChannel: IntentWithChannelLocalizations,
	intentWithoutChannel: IntentWithoutChannelLocalizations,
	link: LinkLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Tracker["help"]>(tracker["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Tracker["reply"]>(tracker["reply"]);
const intentWithChannelLocalizations: IntentWithChannelLocalizations = compileAll<Tracker["intentWithChannel"]>(tracker["intentWithChannel"]);
const intentWithoutChannelLocalizations: IntentWithoutChannelLocalizations = compileAll<Tracker["intentWithoutChannel"]>(tracker["intentWithoutChannel"]);
const linkLocalizations: LinkLocalizations = compileAll<Tracker["link"]>(tracker["link"]);
const trackerCompilation: TrackerCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	intentWithChannel: intentWithChannelLocalizations,
	intentWithoutChannel: intentWithoutChannelLocalizations,
	link: linkLocalizations,
};
export default trackerCompilation;
