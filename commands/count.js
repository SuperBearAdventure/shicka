import discord from "discord.js";
import Command from "../command.js";
const {Util} = discord;
export default class CountCommand extends Command {
	async execute(interaction) {
		const {guild} = interaction;
		const {memberCount, name} = guild;
		await interaction.reply(`There are ${Util.escapeMarkdown(`${memberCount}`)} members on the official *${Util.escapeMarkdown(name)}* *Discord* server!`);
	}
	describe(interaction, name) {
		const description = `Type \`/${name}\` to know the number of members on the server`;
		return {name, description};
	}
}
