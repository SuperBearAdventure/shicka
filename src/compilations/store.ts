import type {Store} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {store} from "../definitions.js";
import {compileAll} from "../utils/string.js";
type HelpLocalizations = Localized<(groups: Store["help"]) => string>;
type ReplyLocalizations = Localized<(groups: Store["reply"]) => string>;
type LinkLocalizations = Localized<(groups: Store["link"]) => string>;
type StoreCompilation = {
	help: HelpLocalizations,
	reply: ReplyLocalizations,
	link: LinkLocalizations,
};
const helpLocalizations: HelpLocalizations = compileAll<Store["help"]>(store["help"]);
const replyLocalizations: ReplyLocalizations = compileAll<Store["reply"]>(store["reply"]);
const linkLocalizations: LinkLocalizations = compileAll<Store["link"]>(store["link"]);
const storeCompilation: StoreCompilation = {
	help: helpLocalizations,
	reply: replyLocalizations,
	link: linkLocalizations,
};
export default storeCompilation;
