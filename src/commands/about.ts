const aboutCommand = {
	register(name) {
		const description = "Tells you where I come from";
		return {name, description};
	},
	async execute(interaction) {
		if (!interaction.isCommand()) {
			return;
		}
		await interaction.reply("I am *Shicka*, a bot made by *PolariTOON*, and I am open source!\nMy code is available [there](<https://github.com/SuperBearAdventure/shicka>).");
	},
	describe(interaction, name) {
		return `Type \`/${name}\` to know where I come from`;
	},
};
export default aboutCommand;
