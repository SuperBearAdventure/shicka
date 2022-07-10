import type {
	CommandInteraction,
	Message,
} from "discord.js";
import rule7Trigger from "./triggers/rule7.js";
type Trigger = {
	execute(message: Message): Promise<void>;
	describe(interaction: CommandInteraction): string | null;
};
const rule7: Trigger = rule7Trigger;
export default Trigger;
export {
	rule7,
};
