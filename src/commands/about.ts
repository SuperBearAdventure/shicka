import type {
	ApplicationCommandData,
	CommandInteraction,
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
	bot: () => string,
	author: () => string,
	link: () => string,
};
const commandName: string = "about";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you where I come from",
	"fr": "Te dit d'où je viens",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const bot: string = "Shicka";
const author: string = "PolariTOON";
const link: string = "https://github.com/SuperBearAdventure/shicka";
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know where I come from",
	"fr": "Tape `/$<commandName>` pour savoir d'où je viens",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "I am *$<bot>*, a bot made by *$<author>*, and I am open source!\nMy code is available [there](<$<link>>).",
	"fr": "Je suis *$<bot>*, un robot fait par *$<author>*, et je suis open source !\nMon code est disponible [là](<$<link>>).",
});
const aboutCommand: Command = {
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
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				bot: (): string => {
					return Util.escapeMarkdown(bot);
				},
				author: (): string => {
					return Util.escapeMarkdown(author);
				},
				link: (): string => {
					return Util.escapeMarkdown(link);
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
export default aboutCommand;
