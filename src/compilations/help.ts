import type {Help} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {help} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Help["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Help["reply"]) => string>;
type BareReplyLocalizations = Localized<(groups: Help["bareReply"]) => string>;
type NoFeatureReplyLocalizations = Localized<(groups: Help["noFeatureReply"]) => string>;
type HelpCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	bareReply: BareReplyLocalizations,
	noFeatureReply: NoFeatureReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Help["help"]>(help["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Help["reply"]>(help["reply"]);
const bareReplyLocalizations: BareReplyLocalizations = compileAll<Help["bareReply"]>(help["bareReply"]);
const noFeatureReplyLocalizations: NoFeatureReplyLocalizations = compileAll<Help["noFeatureReply"]>(help["noFeatureReply"]);
const helpCompilation: HelpCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	bareReply: bareReplyLocalizations,
	noFeatureReply: noFeatureReplyLocalizations,
};
export default helpCompilation;
