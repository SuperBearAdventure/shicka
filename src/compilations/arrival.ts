import type {Arrival} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {arrival} from "../definitions.js";
import {compile, compileAll} from "../utils/string.js";
type HelpWithChannelLocalizations = Localized<(groups: Arrival["helpWithChannel"]) => string>;
type HelpWithoutChannelLocalizations = Localized<(groups: Arrival["helpWithoutChannel"]) => string>;
type Greeting = (groups: Arrival["greetings"][number]) => string;
type ArrivalCompilation = {
	helpWithChannel: HelpWithChannelLocalizations,
	helpWithoutChannel: HelpWithoutChannelLocalizations,
	greetings: Greeting[],
};
const helpWithChannelLocalizations: HelpWithChannelLocalizations = compileAll<Arrival["helpWithChannel"]>(arrival["helpWithChannel"]);
const helpWithoutChannelLocalizations: HelpWithoutChannelLocalizations = compileAll<Arrival["helpWithoutChannel"]>(arrival["helpWithoutChannel"]);
const greetings: Greeting[] = arrival["greetings"].map((greeting: string): Greeting => {
	return compile<Arrival["greetings"][number]>(greeting);
});
const arrivalCompilation: ArrivalCompilation = {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
	greetings,
};
export default arrivalCompilation;
