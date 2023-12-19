import type {
	ApplicationCommandSubCommandData,
	ChatInputCommandInteraction,
} from "discord.js";
import type Binding from "../bindings.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Raw as RawCompilation} from "../compilations.js";
import type {Raw as RawDefinition} from "../definitions.js";
import type {Raw as RawDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ApplicationCommandOptionType,
	escapeMarkdown,
} from "discord.js";
import * as bindings from "../bindings.js";
import {raw as rawCompilation} from "../compilations.js";
import {raw as rawDefinition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpGroups = RawDependency["help"];
const {
	commandName,
	commandDescription,
	// typeOptionName,
	typeOptionDescription,
	identifierOptionName,
	identifierOptionDescription,
}: RawDefinition = rawDefinition;
const {
	help: helpLocalizations,
}: RawCompilation = rawCompilation;
function naiveSingularForm(pluralForm: string): string {
	if (pluralForm.endsWith("ies")) {
		return `${pluralForm.slice(0, -3)}y`;
	}
	return pluralForm.slice(0, -1);
}
function naivePluralForm(singularForm: string): string {
	if (singularForm.endsWith("y")) {
		return `${singularForm.slice(0, -1)}ies`;
	}
	return `${singularForm}s`;
}
const rawCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
			options: Object.keys(bindings).map<[string, Binding]>((bindingName: string): [string, Binding] => {
				const binding: Binding = bindings[bindingName as keyof typeof bindings] as Binding;
				return [bindingName, binding];
			}).filter(([bindingName, binding]: [string, Binding]): boolean => {
				return binding.length !== 0;
			}).map<ApplicationCommandSubCommandData>(([bindingName, binding]: [string, Binding]): ApplicationCommandSubCommandData => {
				const subCommandName: string = naiveSingularForm(bindingName);
				const subCommandDescription: Localized<string> = commandDescription;
				return {
					type: ApplicationCommandOptionType.Subcommand,
					name: subCommandName,
					description: subCommandDescription["en-US"],
					descriptionLocalizations: subCommandDescription,
					options: [
						{
							type: ApplicationCommandOptionType.Integer,
							name: identifierOptionName,
							description: identifierOptionDescription["en-US"],
							descriptionLocalizations: identifierOptionDescription,
							required: true,
							minValue: 0,
							maxValue: binding.length - 1,
						},
					],
				};
			}),
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {options}: ChatInputCommandInteraction<"cached"> = interaction;
 		const bindingName: string = naivePluralForm(options.getSubcommand(true));
		const binding: Binding = bindings[bindingName as keyof typeof bindings] as Binding;
		const identifier: number = options.getInteger(identifierOptionName, true);
		const datum: string = JSON.stringify(binding[identifier], null, "\t");
		await interaction.reply({
			content: `\`\`\`json\n${escapeMarkdown(datum)}\n\`\`\``,
		});
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				commandMention: (): string => {
					return `</${commandName}:${applicationCommand.id}>`;
				},
				typeOptionDescription: (): string => {
					return typeOptionDescription[locale];
				},
				identifierOptionDescription: (): string => {
					return identifierOptionDescription[locale];
				},
			};
		}));
	},
};
export default rawCommand;
