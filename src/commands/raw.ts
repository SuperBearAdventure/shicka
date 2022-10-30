import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Binding from "../bindings.js";
import type Command from "../commands.js";
import type {Localized} from "../utils/string.js";
import {Util} from "discord.js";
import * as bindings from "../bindings.js";
import {compileAll, composeAll, localize} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
	typeOptionDescription: () => string,
	identifierOptionDescription: () => string,
};
const commandName: string = "raw";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you what is the datum of this type with this identifier",
	"fr": "Te dit quelle est la donnée de ce type avec cet identifiant",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const typeOptionName: string = "type";
const typeOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some type",
	"fr": "Un type",
};
const typeOptionDescription: string = typeOptionDescriptionLocalizations["en-US"];
const identifierOptionName: string = "identifier";
const identifierOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some identifier",
	"fr": "Un identifiant",
};
const identifierOptionDescription: string = identifierOptionDescriptionLocalizations["en-US"];
const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName> $<typeOptionDescription> $<identifierOptionDescription>` to know what is the datum of `$<typeOptionDescription>` with `$<identifierOptionDescription>`",
	"fr": "Tape `/$<commandName> $<typeOptionDescription> $<identifierOptionDescription>` pour savoir quel est la donnée d'`$<typeOptionDescription>` avec `$<identifierOptionDescription>`",
});
const rawCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
			options: [
				{
					type: "STRING",
					name: typeOptionName,
					description: typeOptionDescription,
					descriptionLocalizations: typeOptionDescriptionLocalizations,
					required: true,
					choices: Object.keys(bindings).map<[string, Binding]>((bindingName: string): [string, Binding] => {
						const binding: Binding = bindings[bindingName as keyof typeof bindings] as Binding;
						return [bindingName, binding];
					}).filter(([bindingName, binding]: [string, Binding]): boolean => {
						return binding.length !== 0;
					}).map<ApplicationCommandOptionChoiceData>(([bindingName, binding]: [string, Binding]): ApplicationCommandOptionChoiceData => {
						return {
							name: bindingName,
							value: bindingName,
						};
					}),
				},
				{
					type: "INTEGER",
					name: identifierOptionName,
					description: identifierOptionDescription,
					descriptionLocalizations: identifierOptionDescriptionLocalizations,
					required: true,
					minValue: 0,
				},
			],
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {options}: CommandInteraction = interaction;
		const bindingName: string = options.getString(typeOptionName, true);
		if (!(bindingName in bindings)) {
			const typeConjunction: string = conjunctionFormat.format(Object.keys(bindings).map<string>((bindingName: string): string => {
				return `\`${Util.escapeMarkdown(bindingName)}\``;
			}));
			await interaction.reply({
				content: `I do not know any datum with this name.\nPlease give me a type among ${typeConjunction} instead.`,
				ephemeral: true,
			});
			return;
		}
		const binding: Binding = bindings[bindingName as keyof typeof bindings] as Binding;
		const identifier: number = options.getInteger(identifierOptionName, true);
		if (identifier < 0 || identifier >= binding.length) {
			await interaction.reply({
				content: `I do not know any datum with this identifier.\nPlease give me an identifier between \`0\` and \`${binding.length - 1}\` instead.`,
				ephemeral: true,
			});
			return;
		}
		const datum: string = JSON.stringify(binding[identifier], null, "\t");
		await interaction.reply({
			content: `\`\`\`json\n${Util.escapeMarkdown(datum)}\n\`\`\``,
		});
	},
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: keyof Localized<unknown>): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
				typeOptionDescription: (): string => {
					return typeOptionDescriptionLocalizations[locale];
				},
				identifierOptionDescription: (): string => {
					return identifierOptionDescriptionLocalizations[locale];
				},
			};
		}));
	},
};
export default rawCommand;
