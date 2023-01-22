import type {
	ApplicationCommandData,
	CommandInteraction,
	Guild,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {compileAll, composeAll, localize} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	memberCount: () => string,
	name: () => string,
};
const commandName: string = "count";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you what is the number of members on the server",
	"fr": "Te dit quel est le nombre de membres sur le serveur",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know what is the number of members on the server",
	"fr": "Tape `/$<commandName>` pour savoir quel est le nombre de membres sur le serveur",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "There are $<memberCount> members on the official *$<name>* *Discord* server!",
	"fr": "Il y a $<memberCount> membres sur le serveur *Discord* officiel de *$<name>* !",
});
const countCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
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
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				memberCount: (): string => {
					return Util.escapeMarkdown(`${memberCount}`);
				},
				name: (): string => {
					return Util.escapeMarkdown(name);
				},
			}),
		});
	},
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
			};
		}));
	},
};
export default countCommand;
