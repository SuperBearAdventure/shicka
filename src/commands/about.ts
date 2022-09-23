import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Localized} from "../utils/string.js";
const commandName: string = "about";
const commandDescription: string = "Tells you where I come from";
const helpLocalizations: Localized<() => string> = Object.assign(Object.create(null), {
	"en-US"(): string {
		return `Type \`/${commandName}\` to know where I come from`;
	},
	"fr"(): string {
		return `Tape \`/${commandName}\` pour savoir d'où je viens`;
	},
});
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
		await interaction.reply({
			content: "I am *Shicka*, a bot made by *PolariTOON*, and I am open source!\nMy code is available [there](<https://github.com/SuperBearAdventure/shicka>).",
		});
	},
	describe(interaction: CommandInteraction): Localized<() => string> {
		return helpLocalizations;
	},
};
export default aboutCommand;
