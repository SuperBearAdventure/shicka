import type {Trailer} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {trailer} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Trailer["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Trailer["reply"]) => string>;
type DefaultReplyLocalizations = Localized<(groups: Trailer["defaultReply"]) => string>;
type LinkLocalizations = Localized<(groups: Trailer["link"]) => string>;
type TrailerCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	defaultReply: DefaultReplyLocalizations,
	link: LinkLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Trailer["help"]>(trailer["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Trailer["reply"]>(trailer["reply"]);
const defaultReplyLocalizations: DefaultReplyLocalizations = compileAll<Trailer["defaultReply"]>(trailer["defaultReply"]);
const linkLocalizations: LinkLocalizations = compileAll<Trailer["link"]>(trailer["link"]);
const trailerCompilation: TrailerCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	defaultReply: defaultReplyLocalizations,
	link: linkLocalizations,
};
export default trailerCompilation;
