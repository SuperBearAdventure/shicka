import Trigger from "../trigger.js";
const pattern = /\b(?:console|multi-?player|online|pc|playstation|ps[45]|switch|xbox)\b/isu;
const roles = new Set(["Cookie!", "Game Developer", "Moderator"]);
export default class Rule7Trigger extends Trigger {
	async execute(message) {
		if (!message.content.match(pattern)) {
			return;
		}
		if (message.member.roles.cache.some((role) => {
			return roles.has(role.name);
		})) {
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
	async describe(message) {
		return "I will *gently* reprimand you if you write words which violate the rule 7";
	}
}
