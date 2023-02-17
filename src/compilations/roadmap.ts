
import type {Roadmap} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {roadmap} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Roadmap["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Roadmap["reply"]) => string>;
type IntentWithChannelLocalizations = Localized<(groups: Roadmap["intentWithChannel"]) => string>;
type IntentWithoutChannelLocalizations = Localized<(groups: Roadmap["intentWithoutChannel"]) => string>;
type RoadmapCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	intentWithChannel: IntentWithChannelLocalizations,
	intentWithoutChannel: IntentWithoutChannelLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Roadmap["help"]>(roadmap["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Roadmap["reply"]>(roadmap["reply"]);
const intentWithChannelLocalizations: IntentWithChannelLocalizations = compileAll<Roadmap["intentWithChannel"]>(roadmap["intentWithChannel"]);
const intentWithoutChannelLocalizations: IntentWithoutChannelLocalizations = compileAll<Roadmap["intentWithoutChannel"]>(roadmap["intentWithoutChannel"]);
const roadmapCompilation: RoadmapCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	intentWithChannel: intentWithChannelLocalizations,
	intentWithoutChannel: intentWithoutChannelLocalizations,
};
export default roadmapCompilation;
