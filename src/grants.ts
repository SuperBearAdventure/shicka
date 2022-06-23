import type {CommandInteraction, Message} from "discord.js";
import chatGrant from "./grants/chat.js";
import emojiGrant from "./grants/emoji.js";
type Grant = {
	execute(message: Message, parameter: string[], tokens: string[]): Promise<void>;
	describe(interaction: CommandInteraction, name: string): string | null;
};
const chat: Grant = chatGrant;
const emoji: Grant = emojiGrant;
export default Grant;
export {
	chat,
	emoji,
};
