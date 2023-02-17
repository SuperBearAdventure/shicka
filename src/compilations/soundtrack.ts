import type {Soundtrack} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {soundtrack} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Soundtrack["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Soundtrack["reply"]) => string>;
type DefaultReplyLocalizations = Localized<(groups: Soundtrack["defaultReply"]) => string>;
type LinkLocalizations = Localized<(groups: Soundtrack["link"]) => string>;
type SoundtrackCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	defaultReply: DefaultReplyLocalizations,
	link: LinkLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Soundtrack["help"]>(soundtrack["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Soundtrack["reply"]>(soundtrack["reply"]);
const defaultReplyLocalizations: DefaultReplyLocalizations = compileAll<Soundtrack["defaultReply"]>(soundtrack["defaultReply"]);
const linkLocalizations: LinkLocalizations = compileAll<Soundtrack["link"]>(soundtrack["link"]);
const soundtrackCompilation: SoundtrackCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	defaultReply: defaultReplyLocalizations,
	link: linkLocalizations,
};
export default soundtrackCompilation;
