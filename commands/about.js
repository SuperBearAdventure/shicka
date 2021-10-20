import Command from "../command.js";
export default class AboutCommand extends Command {
	async execute(interaction) {
		await interaction.reply("I am *Shicka*, a bot made by *PolariTOON*, and I am open source!\nMy code is available there:\nhttps://github.com/SuperBearAdventure/shicka");
	}
	describe(interaction, name) {
		const description = `Type \`/${name}\` to know where I come from`;
		return {name, description};
	}
}
