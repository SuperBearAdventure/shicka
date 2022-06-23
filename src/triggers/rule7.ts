const pattern = /\b(?:co-?op(?:erati(?:ons?|ve))?|consoles?|multi(?:-?player)?|online|pc|playstation|ps[45]|switch|xbox)\b/iu;
const roles = new Set(["Administrator", "Cookie", "Game Developer", "Moderator"]);
const rule7Trigger = {
	async execute(message) {
		const {channel} = message;
		if (!("name" in channel) || channel.name !== "💡・game-suggestions") {
			return;
		}
		const {member} = message;
		if (member == null) {
			return;
		}
		if (member.roles.cache.some((role) => {
			return roles.has(role.name);
		})) {
			return;
		}
		if (message.content.match(pattern) == null) {
			return;
		}
		const {guild} = message;
		if (guild == null) {
			return;
		}
		const emoji = guild.emojis.cache.find((emoji) => {
			return emoji.name === "RULE7";
		});
		if (emoji != null) {
			await message.reply(`${emoji}`);
		}
		const rulesChannel = guild.channels.cache.find((channel) => {
			return channel.name === "❗・rules-info・❗";
		});
		if (rulesChannel != null) {
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
	},
	describe(interaction, name) {
		const {guild} = interaction;
		if (guild == null) {
			return null;
		}
		const channel = guild.channels.cache.find((channel) => {
			return channel.name === "💡・game-suggestions";
		});
		if (channel == null) {
			return null;
		}
		return `I will gently reprimand you if you write words which violate the rule 7 in ${channel}`;
	},
};
export default rule7Trigger;
