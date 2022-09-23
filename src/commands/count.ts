import type {
	ApplicationCommandData,
	CommandInteraction,
	Guild,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Localized} from "../utils/string.js";
import {Util} from "discord.js";
const commandName: string = "count";
const commandDescription: string = "Tells you what is the number of members on the server";
const helpLocalizations: Localized<() => string> = Object.assign(Object.create(null), {
	"en-US"(): string {
		return `Type \`/${commandName}\` to know what is the number of members on the server`;
	},
	"fr"(): string {
		return `Tape \`/${commandName}\` pour savoir quel est le nombre de membres sur le serveur`;
	},
});
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
	describe(interaction: CommandInteraction): Localized<() => string> {
		return helpLocalizations;
	},
};
export default countCommand;
