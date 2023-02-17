import type {Raw} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {raw} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Raw["help"]) => string>;
type NoTypeReplyLocalizations = Localized<(groups: Raw["noTypeReply"]) => string>;
type NoIdentifierReplyLocalizations = Localized<(groups: Raw["noIdentifierReply"]) => string>;
type RawCompilation = {
	help: HelpLocalizations,
	noTypeReply: NoTypeReplyLocalizations,
	noIdentifierReply: NoIdentifierReplyLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Raw["help"]>(raw["help"]);
const noTypeReplyLocalizations: NoTypeReplyLocalizations = compileAll<Raw["noTypeReply"]>(raw["noTypeReply"]);
const noIdentifierReplyLocalizations: NoIdentifierReplyLocalizations = compileAll<Raw["noIdentifierReply"]>(raw["noIdentifierReply"]);
const rawCompilation: RawCompilation = {
	help: helpLocalizations,
	noTypeReply: noTypeReplyLocalizations,
	noIdentifierReply: noIdentifierReplyLocalizations,
};
export default rawCompilation;
