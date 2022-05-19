import Command from "../command.js";
const stores = [
	"[*European store*](<https://superbearadventure.myspreadshop.net/>)",
	"[*American and Oceanian store*](<https://superbearadventure.myspreadshop.com/>)",
];
export default class StoreCommand extends Command {
	register(client, name) {
		const description = "Tells you where to buy offical products of the game";
		return {name, description};
	}
	async execute(interaction) {
		const linkList = stores.map((store) => {
			return `\u{2022} ${store}`;
		}).join("\n");
		await interaction.reply({
			content: `You can buy official products of the game there:\n${linkList}`,
		});
	}
	describe(interaction, name) {
		return `Type \`/${name}\` to know where to buy offical products of the game`;
	}
}
