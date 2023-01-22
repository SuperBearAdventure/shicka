import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Binding from "../bindings.js";
import type Command from "../commands.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import * as bindings from "../bindings.js";
import {compileAll, composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
	typeOptionDescription: () => string,
	identifierOptionDescription: () => string,
};
type NoTypeReplyGroups = {
	typeConjunction: () => string,
};
type NoIdentifierReplyGroups = {
	max: () => string,
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
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName> $<typeOptionDescription> $<identifierOptionDescription>` to know what is the datum of `$<typeOptionDescription>` with `$<identifierOptionDescription>`",
	"fr": "Tape `/$<commandName> $<typeOptionDescription> $<identifierOptionDescription>` pour savoir quel est la donnée d'`$<typeOptionDescription>` avec `$<identifierOptionDescription>`",
});
const noTypeReplyLocalizations: Localized<(groups: NoTypeReplyGroups) => string> = compileAll<NoTypeReplyGroups>({
	"en-US": "I do not know any datum with this name.\nPlease give me a type among $<typeConjunction> instead.",
	"fr": "Je ne connais aucune donnée avec ce nom.\nMerci de me donner un type parmi $<typeConjunction> à la place.",
});
const noIdentifierReplyLocalizations: Localized<(groups: NoIdentifierReplyGroups) => string> = compileAll<NoIdentifierReplyGroups>({
	"en-US": "I do not know any datum with this identifier.\nPlease give me an identifier between `0` and `$<max>` instead.",
	"fr": "Je ne connais aucune donnée avec cet identifiant.\nMerci de me donner un identifiant entre `0` et `$<max>` à la place.",
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
		const {locale, options}: CommandInteraction = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const bindingName: string = options.getString(typeOptionName, true);
		if (!(bindingName in bindings)) {
			await interaction.reply({
				content: noTypeReplyLocalizations[resolvedLocale]({
					typeConjunction: (): string => {
						const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(resolvedLocale, {
							style: "long",
							type: "conjunction",
						});
						return conjunctionFormat.format(Object.keys(bindings).map<string>((bindingName: string): string => {
							return `\`${Util.escapeMarkdown(bindingName)}\``;
						}));
					},
				}),
				ephemeral: true,
			});
			return;
		}
		const binding: Binding = bindings[bindingName as keyof typeof bindings] as Binding;
		const identifier: number = options.getInteger(identifierOptionName, true);
		if (identifier < 0 || identifier >= binding.length) {
			const max: number = binding.length - 1;
			await interaction.reply({
				content: noIdentifierReplyLocalizations[resolvedLocale]({
					max: (): string => {
						return Util.escapeMarkdown(`${max}`);
					},
				}),
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
