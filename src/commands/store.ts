import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const stores: string[] = [
	"[*European store*](<https://superbearadventure.myspreadshop.net/>)",
	"[*American and Oceanian store*](<https://superbearadventure.myspreadshop.com/>)",
];
const storeCommand: Command = {
	register(name: string): ApplicationCommandData {
		const description: string = "Tells you where to buy offical products of the game";
		return {name, description};
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
	describe(interaction: CommandInteraction, name: string): string | null {
		return `Type \`/${name}\` to know where to buy offical products of the game`;
	},
};
export default storeCommand;
