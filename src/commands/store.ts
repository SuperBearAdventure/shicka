import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const commandNameLocalizations: {[k: string]: string} = {
	"en-US": "store",
	"fr": "magasin",
};
const commandName: string = commandNameLocalizations["en-US"];
const commandDescriptionLocalizations: {[k: string]: string} = {
	"en-US": "Tells you where to buy offical products of the game",
	"fr": "Te dit où acheter des produits officiels du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const stores: string[] = [
	"[*European store*](<https://superbearadventure.myspreadshop.net/>)",
	"[*American and Oceanian store*](<https://superbearadventure.myspreadshop.com/>)",
];
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandNameLocalizations["en-US"]}\` to know where to buy offical products of the game`;
		},
		"fr"(): string {
			return `Tape \`/${commandNameLocalizations["fr"]}\` pour savoir où acheter des produits officiels du jeu`;
		},
	});
}
const storeCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			nameLocalizations: commandNameLocalizations,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const linkList: string = stores.map((store: string): string => {
			return `\u{2022} ${store}`;
		}).join("\n");
		await interaction.reply({
			content: `You can buy official products of the game there:\n${linkList}`,
		});
	},
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		return computeHelpLocalizations();
	},
};
export default storeCommand;
