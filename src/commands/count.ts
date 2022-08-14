import type {
	ApplicationCommandData,
	CommandInteraction,
	Guild,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import {Util} from "discord.js";
const commandName: string = "count";
const commandDescription: string = "Tells you what is the number of members on the server";
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandName}\` to know what is the number of members on the server`;
		},
	});
}
const countCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
		};
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
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		return computeHelpLocalizations();
	},
};
export default countCommand;
