import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Binding from "../bindings.js";
import type Command from "../commands.js";
import type {Raw as RawCompilation} from "../compilations.js";
import type {Raw as RawDefinition} from "../definitions.js";
import type {Raw as RawDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import * as bindings from "../bindings.js";
import {raw as rawCompilation} from "../compilations.js";
import {raw as rawDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = RawDependency["help"];
const {
	commandName,
	commandDescription,
	typeOptionName,
	typeOptionDescription,
	identifierOptionName,
	identifierOptionDescription,
}: RawDefinition = rawDefinition;
const {
	help: helpLocalizations,
	noTypeReply: noTypeReplyLocalizations,
	noIdentifierReply: noIdentifierReplyLocalizations,
}: RawCompilation = rawCompilation;
const rawCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
			options: [
				{
					type: "STRING",
					name: typeOptionName,
					description: typeOptionDescription["en-US"],
					descriptionLocalizations: typeOptionDescription,
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
					description: identifierOptionDescription["en-US"],
					descriptionLocalizations: identifierOptionDescription,
					required: true,
					minValue: 0,
				},
			],
		};
	},
	async execute(interaction: Interaction<"cached">): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {locale, options}: CommandInteraction<"cached"> = interaction;
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
	describe(interaction: CommandInteraction<"cached">): Localized<(groups: {}) => string> | null {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
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
