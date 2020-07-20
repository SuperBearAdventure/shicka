import {Command} from "./command.js";
const pattern = /\b(?:ios|ipad|iphone|multi-?player|online|pc)\b/isu;
async function execute(message) {
	const emoji = message.guild.emojis.cache.find((emoji) => {
		return emoji.name === "RULE7";
	});
	if (typeof emoji !== "undefined") {
		await message.channel.send(`${emoji}`);
	}
	const channel = message.guild.channels.cache.find((channel) => {
		return channel.name === "❗rules❗";
	});
	if (typeof channel !== "undefined") {
		await message.reply(`Please read and respect the ${channel}!`);
	}
	await message.react("🇷");
	await message.react("🇺");
	await message.react("🇱");
	await message.react("🇪");
	await message.react("7️⃣");
}
export class Rule7Command extends Command {
	constructor() {
		super(pattern, execute);
	}
}
