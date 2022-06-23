import {Util} from "discord.js";
const countCommand = {
	register(name) {
		const description = "Tells you what is the number of members on the server";
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
		const {memberCount, name} = guild;
		await interaction.reply(`There are ${Util.escapeMarkdown(`${memberCount}`)} members on the official *${Util.escapeMarkdown(name)}* *Discord* server!`);
	},
	describe(interaction, name) {
		return `Type \`/${name}\` to know what is the number of members on the server`;
	},
};
export default countCommand;
