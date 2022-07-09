import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Binding from "../bindings.js";
import type Command from "../commands.js";
import {Util} from "discord.js";
import * as bindings from "../bindings.js";
const commandNameLocalizations: {[k: string]: string} = {
	"en-US": "raw",
	"fr": "brut",
};
const commandName: string = commandNameLocalizations["en-US"];
const commandDescriptionLocalizations: {[k: string]: string} = {
	"en-US": "Tells you what is the datum of this type with this identifier",
	"fr": "Te dit quelle est la donnée de ce type avec cet identifiant",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const typeOptionNameLocalizations: {[k: string]: string} = {
	"en-US": "type",
	"fr": "costume",
};
const typeOptionName: string = typeOptionNameLocalizations["en-US"];
const typeOptionDescriptionLocalizations: {[k: string]: string} = {
	"en-US": "Some type",
	"fr": "Un type",
};
const typeOptionDescription: string = typeOptionDescriptionLocalizations["en-US"];
const identifierOptionNameLocalizations: {[k: string]: string} = {
	"en-US": "identifier",
	"fr": "identifiant",
};
const identifierOptionName: string = identifierOptionNameLocalizations["en-US"];
const identifierOptionDescriptionLocalizations: {[k: string]: string} = {
	"en-US": "Some identifier",
	"fr": "Un identifiant",
};
const identifierOptionDescription: string = identifierOptionDescriptionLocalizations["en-US"];
const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandNameLocalizations["en-US"]} ${typeOptionDescriptionLocalizations["en-US"]} ${identifierOptionDescriptionLocalizations["en-US"]}\` to know what is the datum of \`${typeOptionDescriptionLocalizations["en-US"]}\` with \`${identifierOptionDescriptionLocalizations["en-US"]}\``;
		},
		"fr"(): string {
			return `Tape \`/${commandName} ${typeOptionDescription} ${identifierOptionDescription}\` pour savoir quel est la donnée d'\`${typeOptionDescription}\` avec \`${identifierOptionDescription}\``;
		},
	});
}
const rawCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			nameLocalizations: commandNameLocalizations,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
			options: [
				{
					type: "STRING",
					name: typeOptionName,
					nameLocalizations: typeOptionNameLocalizations,
					description: typeOptionDescription,
					descriptionLocalizations: typeOptionDescriptionLocalizations,
					required: true,
					choices: Object.keys(bindings).map((bindingName: string): [string, Binding] => {
						const binding: Binding = bindings[bindingName as keyof typeof bindings] as Binding;
						return [bindingName, binding];
					}).filter(([bindingName, binding]: [string, Binding]): boolean => {
						return binding.length !== 0;
					}).map(([bindingName, binding]: [string, Binding]): ApplicationCommandOptionChoiceData => {
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
			const typeConjunction: string = conjunctionFormat.format(Object.keys(bindings).map((bindingName: string): string => {
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
		await interaction.reply(`\`\`\`json\n${Util.escapeMarkdown(datum)}\n\`\`\``);
	},
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		return computeHelpLocalizations();
	},
};
export default rawCommand;
