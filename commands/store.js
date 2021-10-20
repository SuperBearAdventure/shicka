import Command from "../command.js";
const stores = [
	"*European store*: https://shop.spreadshirt.net/SuperBearAdventure",
	"*American and Oceanian store*: https://shop.spreadshirt.com/SuperBearAdventure",
];
export default class StoreCommand extends Command {
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
		const description = `Type \`/${name}\` to know where to buy offical products of the game`;
		return {name, description};
	}
}
