import type {Gate} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {gate} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Gate["help"]) => string>;
type ApproveHelpLocalizations = Localized<(groups: Gate["approveHelp"]) => string>;
type RefuseHelpLocalizations = Localized<(groups: Gate["refuseHelp"]) => string>;
type NoChannelReplyLocalizations = Localized<(groups: Gate["noChannelReply"]) => string>;
type NoMessageReplyLocalizations = Localized<(groups: Gate["noMessageReply"]) => string>;
type GateCompilation = {
	help: HelpLocalizations,
	approveHelp: ApproveHelpLocalizations,
	refuseHelp: RefuseHelpLocalizations,
	noChannelReply: NoChannelReplyLocalizations,
	noMessageReply: NoMessageReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Gate["help"]>(gate["help"]);
const approveHelpLocalizations: ApproveHelpLocalizations = compileAll<Gate["approveHelp"]>(gate["approveHelp"]);
const refuseHelpLocalizations: RefuseHelpLocalizations = compileAll<Gate["refuseHelp"]>(gate["refuseHelp"]);
const noChannelReplyLocalizations: NoChannelReplyLocalizations = compileAll<Gate["noChannelReply"]>(gate["noChannelReply"]);
const noMessageReplyLocalizations: NoMessageReplyLocalizations = compileAll<Gate["noMessageReply"]>(gate["noMessageReply"]);
const gateCompilation: GateCompilation = {
	help: helpLocalizations,
	approveHelp: approveHelpLocalizations,
	refuseHelp: refuseHelpLocalizations,
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
};
export default gateCompilation;
