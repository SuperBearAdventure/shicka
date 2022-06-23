const trackers = [
	"[*Current tracker*](<https://github.com/SuperBearAdventure/tracker>)",
	"[*Former tracker*](<https://trello.com/b/yTojOuqv/super-bear-adventure-bugs>)",
];
const trackerCommand = {
	register(name) {
		const description = "Tells you where to check known bugs of the game";
		return {name, description};
	},
	async execute(interaction) {
		if (!interaction.isCommand()) {
			return;
		}
		const linkList = trackers.map((tracker) => {
			return `\u{2022} ${tracker}`;
		}).join("\n");
		const {guild} = interaction;
		if (guild == null) {
			return;
		}
		const channel = guild.channels.cache.find((channel) => {
			return channel.name === "🐛・bug-report";
		});
		const intent = channel != null ? `Before reporting a bug in ${channel},` : "You can";
		await interaction.reply({
			content: `${intent} check the known bugs of the game there:\n${linkList}`,
		});
	},
	describe(interaction, name) {
		return `Type \`/${name}\` to know where to check known bugs of the game`;
	},
};
export default trackerCommand;
