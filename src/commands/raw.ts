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
const commandName: string = "raw";
const commandDescription: string = "Tells you what is the datum of this type with this identifier";
const typeOptionName: string = "type";
const typeOptionDescription: string = "Some type";
const identifierOptionName: string = "identifier";
const identifierOptionDescription: string = "Some identifier";
const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
const rawCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
			options: [
				{
					type: "STRING",
					name: typeOptionName,
					description: typeOptionDescription,
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
	describe(interaction: CommandInteraction): string | null {
		return `Type \`/${commandName} ${typeOptionDescription} ${identifierOptionDescription}\` to know what is the datum of \`${typeOptionDescription}\` with \`${identifierOptionDescription}\``;
	},
};
export default rawCommand;
