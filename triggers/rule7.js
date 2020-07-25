import Trigger from "../trigger.js";
const pattern = /\b(?:ios|ipad|iphone|multi-?player|online|pc)\b/isu;
export default class Rule7Trigger extends Trigger {
	async execute(message) {
		if (!message.content.match(pattern)) {
			return;
		}
		const {guild} = message;
		const emoji = guild.emojis.cache.find((emoji) => {
			return emoji.name === "RULE7";
		});
		if (typeof emoji !== "undefined") {
			await message.channel.send(`${emoji}`);
		}
		const channel = guild.channels.cache.find((channel) => {
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
	async describe() {
		return `Some words that violate the rule 7 will be flagged as such`;
	}
}
