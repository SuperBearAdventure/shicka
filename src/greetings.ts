import byeGreeting from "./greetings/bye.json" assert {type: "json"};
import heyGreeting from "./greetings/hey.json" assert {type: "json"};
type Greeting = string[];
const bye: Greeting = byeGreeting;
const hey: Greeting = heyGreeting;
export default Greeting;
export {
	bye,
	hey,
};
