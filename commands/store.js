import Command from "../command.js";
const stores = [
	"*European store*: https://shop.spreadshirt.net/SuperBearAdventure",
	"*American and Oceanian store*: https://shop.spreadshirt.com/SuperBearAdventure",
];
export default class StoreCommand extends Command {
	register(client, name) {
		const description = "Tells you where to buy offical products of the game";
		return {name, description};
	}
	async execute(interaction) {
		const linkList = stores.map((store) => {
			return `- ${store}`;
		}).join("\n");
		await (await interaction.reply({
			content: `You can buy official products of the game there:\n${linkList}`,
			fetchReply: true,
		})).suppressEmbeds(true);
	}
	describe(interaction, name) {
		return `Type \`/${name}\` to know where to buy offical products of the game`;
	}
}
