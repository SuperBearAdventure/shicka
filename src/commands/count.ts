import type {
	ApplicationCommandData,
	CommandInteraction,
	Guild,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Count as CountCompilation} from "../compilations.js";
import type {Count as CountDefinition} from "../definitions.js";
import type {Count as CountDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
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
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {guild, locale}: CommandInteraction = interaction;
		const resolvedLocale: Locale = resolve(locale);
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
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: replyLocalizations[resolvedLocale]({
				memberCount: (): string => {
					return Util.escapeMarkdown(`${memberCount}`);
				},
				name: (): string => {
					return Util.escapeMarkdown(name);
				},
			}),
			ephemeral: true,
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
