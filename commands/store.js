import Command from "../command.js";
const stores = [
	"*European store*: https://shop.spreadshirt.net/SuperBearAdventure",
	"*American and Oceanian store*: https://shop.spreadshirt.com/SuperBearAdventure",
];
export default class StoreCommand extends Command {
	async execute(message, parameters) {
		const links = stores.map((store) => {
			return `- ${store}`;
		}).join("\n");
		await (await message.reply(`You can buy official products of the game there:\n${links}`)).suppressEmbeds(true);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know where to buy offical products of the game`;
	}
}
