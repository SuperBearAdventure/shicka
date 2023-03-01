import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {About as AboutCompilation} from "../compilations.js";
import type {About as AboutDefinition} from "../definitions.js";
import type {About as AboutDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {about as aboutCompilation} from "../compilations.js";
import {about as aboutDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = AboutDependency["help"];
const {
	commandName,
	commandDescription,
}: AboutDefinition = aboutDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
}: AboutCompilation = aboutCompilation;
const bot: string = "Shicka";
const author: string = "PolariTOON";
const link: string = "https://github.com/SuperBearAdventure/shicka";
const aboutCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
		};
	},
	async execute(interaction: Interaction<"cached">): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {locale}: Interaction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				bot: (): string => {
					return Util.escapeMarkdown(bot);
				},
				author: (): string => {
					return Util.escapeMarkdown(author);
				},
				link: (): string => {
					return link;
				},
			}),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: replyLocalizations[resolvedLocale]({
				bot: (): string => {
					return Util.escapeMarkdown(bot);
				},
				author: (): string => {
					return Util.escapeMarkdown(author);
				},
				link: (): string => {
					return link;
				},
			}),
			ephemeral: true,
		});
	},
	describe(interaction: CommandInteraction<"cached">): Localized<(groups: {}) => string> | null {
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
