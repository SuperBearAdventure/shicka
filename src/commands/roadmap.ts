const roadmapCommand = {
	register(name) {
		const description = "Tells you where to check the upcoming milestones of the game";
		return {name, description};
	},
	async execute(interaction) {
		if (!interaction.isCommand()) {
			return;
		}
		const {guild} = interaction;
		if (guild == null) {
			return;
		}
		const channel = guild.channels.cache.find((channel) => {
			return channel.name === "💡・game-suggestions";
		});
		const intent = channel != null ? `Before suggesting an idea in ${channel},` : "You can";
		await interaction.reply({
			content: `${intent} check the upcoming milestones of the game [there](<https://trello.com/b/3DPL9CwV/road-to-100>).`,
		});
	},
	describe(interaction, name) {
		return `Type \`/${name}\` to know where to check the upcoming milestones of the game`;
	},
};
export default roadmapCommand;
