import type {Update} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {update} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Update["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Update["reply"]) => string>;
type DefaultReplyLocalizations = Localized<(groups: Update["defaultReply"]) => string>;
type LinkLocalizations = Localized<(groups: Update["link"]) => string>;
type UpdateCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	defaultReply: DefaultReplyLocalizations,
	link: LinkLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Update["help"]>(update["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Update["reply"]>(update["reply"]);
const defaultReplyLocalizations: DefaultReplyLocalizations = compileAll<Update["defaultReply"]>(update["defaultReply"]);
const linkLocalizations: LinkLocalizations = compileAll<Update["link"]>(update["link"]);
const updateCompilation: UpdateCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	defaultReply: defaultReplyLocalizations,
	link: linkLocalizations,
};
export default updateCompilation;
