import Command from "../command.js";
export default class AboutCommand extends Command {
	register(client, name) {
		const description = "Tells you where I come from";
		return {name, description};
	}
	async execute(interaction) {
		await interaction.reply("I am *Shicka*, a bot made by *PolariTOON*, and I am open source!\nMy code is available there:\nhttps://github.com/SuperBearAdventure/shicka");
	}
	describe(interaction, name) {
		return `Type \`/${name}\` to know where I come from`;
	}
}
