import Trigger from "../trigger.js";
const pattern = /\b(?:co-?op(?:erati(?:ons?|ve))?|consoles?|multi(?:-?player)?|online|pc|playstation|ps[45]|switch|xbox)\b/isu;
const roles = new Set(["Administrator", "Cookie", "Game Developer", "Moderator"]);
export default class Rule7Trigger extends Trigger {
	async execute(message) {
		if (message.channel.name !== "🤔suggestions") {
			return;
		}
		if (message.member.roles.cache.some((role) => {
			return roles.has(role.name);
		})) {
			return;
		}
		if (message.content.match(pattern) == null) {
			return;
		}
		const {guild} = message;
		const emoji = guild.emojis.cache.find((emoji) => {
			return emoji.name === "RULE7";
		});
		if (emoji != null) {
			await message.reply(`${emoji}`);
		}
		const channel = guild.channels.cache.find((channel) => {
			return channel.name === "❗rules❗";
		});
		if (channel != null) {
			await message.reply(`Please read and respect the ${channel}!`);
		}
		await message.react("🇷");
		await message.react("🇺");
		await message.react("🇱");
		await message.react("🇪");
		await message.react("7️⃣");
		if (emoji != null) {
			await message.react(emoji);
		}
	}
	describe(interaction, name) {
		const channel = interaction.guild.channels.cache.find((channel) => {
			return channel.name === "🤔suggestions";
		});
		return channel != null ? `I will gently reprimand you if you write words which violate the rule 7 in ${channel}` : null;
	}
}
