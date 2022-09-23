import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Localized} from "../utils/string.js";
import {list} from "../utils/string.js";
const commandName: string = "store";
const commandDescription: string = "Tells you where to buy offical products of the game";
const stores: string[] = [
	"[*European store*](<https://superbearadventure.myspreadshop.net/>)",
	"[*American and Oceanian store*](<https://superbearadventure.myspreadshop.com/>)",
];
const helpLocalizations: Localized<() => string> = Object.assign(Object.create(null), {
	"en-US"(): string {
		return `Type \`/${commandName}\` to know where to buy offical products of the game`;
	},
	"fr"(): string {
		return `Tape \`/${commandName}\` pour savoir où acheter des produits officiels du jeu`;
	},
});
const storeCommand: Command = {
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
		const linkList: string = list(stores);
		await interaction.reply({
			content: `You can buy official products of the game there:\n${linkList}`,
		});
	},
	describe(interaction: CommandInteraction): Localized<() => string> {
		return helpLocalizations;
	},
};
export default storeCommand;
