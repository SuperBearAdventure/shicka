import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const aboutCommand: Command = {
	register(name: string): ApplicationCommandData {
		const description: string = "Tells you where I come from";
		return {name, description};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		await interaction.reply("I am *Shicka*, a bot made by *PolariTOON*, and I am open source!\nMy code is available [there](<https://github.com/SuperBearAdventure/shicka>).");
	},
	describe(interaction: CommandInteraction, name: string): string | null {
		return `Type \`/${name}\` to know where I come from`;
	},
};
export default aboutCommand;
