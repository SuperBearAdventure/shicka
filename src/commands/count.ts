import type {
	ApplicationCommandData,
	CommandInteraction,
	Guild,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import {Util} from "discord.js";
const countCommand: Command = {
	register(name: string): ApplicationCommandData {
		const description: string = "Tells you what is the number of members on the server";
		return {name, description};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {guild}: CommandInteraction = interaction;
		if (guild == null) {
			return;
		}
		const {memberCount, name}: Guild = guild;
		await interaction.reply(`There are ${Util.escapeMarkdown(`${memberCount}`)} members on the official *${Util.escapeMarkdown(name)}* *Discord* server!`);
	},
	describe(interaction: CommandInteraction, name: string): string | null {
		return `Type \`/${name}\` to know what is the number of members on the server`;
	},
};
export default countCommand;
