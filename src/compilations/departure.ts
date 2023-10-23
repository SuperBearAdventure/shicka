import type {Departure} from "../dependencies.js";
import type {Localized} from "../utils/string.js";
import {departure} from "../definitions.js";
import {compile, compileAll} from "../utils/string.js";
type HelpWithChannelLocalizations = Localized<(groups: Departure["helpWithChannel"]) => string>;
type HelpWithoutChannelLocalizations = Localized<(groups: Departure["helpWithoutChannel"]) => string>;
type Greeting = (groups: Departure["greetings"][number]) => string;
type DepartureCompilation = {
	helpWithChannel: HelpWithChannelLocalizations,
	helpWithoutChannel: HelpWithoutChannelLocalizations,
	greetings: Greeting[],
};
const helpWithChannelLocalizations: HelpWithChannelLocalizations = compileAll<Departure["helpWithChannel"]>(departure["helpWithChannel"]);
const helpWithoutChannelLocalizations: HelpWithoutChannelLocalizations = compileAll<Departure["helpWithoutChannel"]>(departure["helpWithoutChannel"]);
const greetings: Greeting[] = departure["greetings"].map((greeting: string): Greeting => {
	return compile<Departure["greetings"][number]>(greeting);
});
const departureCompilation: DepartureCompilation = {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
	greetings,
};
export default departureCompilation;
