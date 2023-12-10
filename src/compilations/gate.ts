import type {Gate} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {gate} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Gate["help"]) => string>;
type NoChannelReplyLocalizations = Localized<(groups: Gate["noChannelReply"]) => string>;
type NoMessageReplyLocalizations = Localized<(groups: Gate["noMessageReply"]) => string>;
type GateCompilation = {
	help: HelpLocalizations,
	noChannelReply: NoChannelReplyLocalizations,
	noMessageReply: NoMessageReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Gate["help"]>(gate["help"]);
const noChannelReplyLocalizations: NoChannelReplyLocalizations = compileAll<Gate["noChannelReply"]>(gate["noChannelReply"]);
const noMessageReplyLocalizations: NoMessageReplyLocalizations = compileAll<Gate["noMessageReply"]>(gate["noMessageReply"]);
const gateCompilation: GateCompilation = {
	help: helpLocalizations,
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
};
export default gateCompilation;
