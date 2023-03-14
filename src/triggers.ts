import type {
	ChatInputCommandInteraction,
	Message,
} from "discord.js";
import type {Localized} from "./utils/string.js";
import rule7Trigger from "./triggers/rule7.js";
type Trigger = {
	execute(message: Message<true>): Promise<void>;
	describe(interaction: ChatInputCommandInteraction<"cached">): Localized<(groups: {}) => string> | null;
};
const rule7: Trigger = rule7Trigger;
export default Trigger;
export {
	rule7,
};
