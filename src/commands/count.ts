import type {
	ApplicationCommandData,
	CommandInteraction,
	Guild,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import {Util} from "discord.js";
const commandNameLocalizations: {[k: string]: string} = {
	"en-US": "count",
	"fr": "décompte",
};
const commandName: string = commandNameLocalizations["en-US"];
const commandDescriptionLocalizations: {[k: string]: string} = {
	"en-US": "Tells you what is the number of members on the server",
	"fr": "Te dit quel est le nombre de membres sur le serveur",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandNameLocalizations["en-US"]}\` to know what is the number of members on the server`;
		},
		"fr"(): string {
			return `Tape \`/${commandNameLocalizations["fr"]}\` pour savoir quel est le nombre de membres sur le serveur`;
		},
	});
}
const countCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			nameLocalizations: commandNameLocalizations,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
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
