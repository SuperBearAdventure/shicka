import type {
	ChatInputCommandInteraction,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {About as AboutCompilation} from "../compilations.js";
import type {About as AboutDefinition} from "../definitions.js";
import type {About as AboutDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
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
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		function formatMessage(locale: Locale): string {
			return replyLocalizations[locale]({
				bot: (): string => {
					return escapeMarkdown(bot);
				},
				author: (): string => {
					return escapeMarkdown(author);
				},
				link: (): string => {
					return link;
				},
			});
		}
		await interaction.reply({
			content: formatMessage("en-US"),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: formatMessage(resolvedLocale),
			ephemeral: true,
		});
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				commandMention: (): string => {
					return `</${commandName}:${applicationCommand.id}>`;
				},
			};
		}));
	},
};
export default aboutCommand;
