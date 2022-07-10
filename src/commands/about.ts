import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const commandName: string = "about";
const commandDescription: string = "Tells you where I come from";
const aboutCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		await interaction.reply("I am *Shicka*, a bot made by *PolariTOON*, and I am open source!\nMy code is available [there](<https://github.com/SuperBearAdventure/shicka>).");
	},
	describe(interaction: CommandInteraction): string | null {
		return `Type \`/${commandName}\` to know where I come from`;
	},
};
export default aboutCommand;