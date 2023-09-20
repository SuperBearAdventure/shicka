import type {
	ApplicationCommand,
	ApplicationCommandData,
	ChatInputCommandInteraction,
	Guild,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Count as CountCompilation} from "../compilations.js";
import type {Count as CountDefinition} from "../definitions.js";
import type {Count as CountDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import {count as countCompilation} from "../compilations.js";
import {count as countDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = CountDependency["help"];
const {
	commandName,
	commandDescription,
}: CountDefinition = countDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
}: CountCompilation = countCompilation;
const countCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
		};
	},
	async execute(interaction: Interaction<"cached">): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {guild, locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const {memberCount, name}: Guild = guild;
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				memberCount: (): string => {
					const cardinalFormat: Intl.NumberFormat = new Intl.NumberFormat("en-US");
					return escapeMarkdown(cardinalFormat.format(memberCount));
				},
				name: (): string => {
					return escapeMarkdown(name);
				},
			}),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: replyLocalizations[resolvedLocale]({
				memberCount: (): string => {
					const cardinalFormat: Intl.NumberFormat = new Intl.NumberFormat(resolvedLocale);
					return escapeMarkdown(cardinalFormat.format(memberCount));
				},
				name: (): string => {
					return escapeMarkdown(name);
				},
			}),
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
export default countCommand;
