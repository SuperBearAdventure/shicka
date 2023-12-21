import type {Gate} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {gate} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Gate["help"]) => string>;
type ApproveHelpLocalizations = Localized<(groups: Gate["approveHelp"]) => string>;
type RefuseHelpLocalizations = Localized<(groups: Gate["refuseHelp"]) => string>;
// type ApproveReplyLocalizations = Localized<(groups: Gate["approveReply"]) => string>;
// type RefuseReplyLocalizations = Localized<(groups: Gate["refuseReply"]) => string>;
type NoChannelReplyLocalizations = Localized<(groups: Gate["noChannelReply"]) => string>;
type NoMessageReplyLocalizations = Localized<(groups: Gate["noMessageReply"]) => string>;
// type NoApprovePermissionReplyLocalizations = Localized<(groups: Gate["noApprovePermissionReply"]) => string>;
// type NoRefusePermissionReplyLocalizations = Localized<(groups: Gate["noRefusePermissionReply"]) => string>;
type GateCompilation = {
	help: HelpLocalizations,
	approveHelp: ApproveHelpLocalizations,
	refuseHelp: RefuseHelpLocalizations,
	// approveReply: ApproveReplyLocalizations,
	// refuseReply: RefuseReplyLocalizations,
	noChannelReply: NoChannelReplyLocalizations,
	noMessageReply: NoMessageReplyLocalizations,
	// noApprovePermissionReply: NoApprovePermissionReplyLocalizations,
	// noRefusePermissionReply: NoRefusePermissionReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Gate["help"]>(gate["help"]);
const approveHelpLocalizations: ApproveHelpLocalizations = compileAll<Gate["approveHelp"]>(gate["approveHelp"]);
const refuseHelpLocalizations: RefuseHelpLocalizations = compileAll<Gate["refuseHelp"]>(gate["refuseHelp"]);
// const approveReplyLocalizations: ApproveReplyLocalizations = compileAll<Gate["approveReply"]>(gate["approveReply"]);
// const refuseReplyLocalizations: RefuseReplyLocalizations = compileAll<Gate["refuseReply"]>(gate["refuseReply"]);
const noChannelReplyLocalizations: NoChannelReplyLocalizations = compileAll<Gate["noChannelReply"]>(gate["noChannelReply"]);
const noMessageReplyLocalizations: NoMessageReplyLocalizations = compileAll<Gate["noMessageReply"]>(gate["noMessageReply"]);
// const noApprovePermissionReplyLocalizations: NoApprovePermissionReplyLocalizations = compileAll<Gate["noApprovePermissionReply"]>(gate["noApprovePermissionReply"]);
// const noRefusePermissionReplyLocalizations: NoRefusePermissionReplyLocalizations = compileAll<Gate["noRefusePermissionReply"]>(gate["noRefusePermissionReply"]);
const gateCompilation: GateCompilation = {
	help: helpLocalizations,
	approveHelp: approveHelpLocalizations,
	refuseHelp: refuseHelpLocalizations,
	// approveReply: approveReplyLocalizations,
	// refuseReply: refuseReplyLocalizations,
	noChannelReply: noChannelReplyLocalizations,
	noMessageReply: noMessageReplyLocalizations,
	// noApprovePermissionReply: noApprovePermissionReplyLocalizations,
	// noRefusePermissionReply: noRefusePermissionReplyLocalizations,
};
export default gateCompilation;
