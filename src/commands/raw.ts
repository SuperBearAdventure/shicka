import type {
	ApplicationCommandData,
	ApplicationCommandOptionData,
	ApplicationCommandOptionChoiceData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Binding from "../bindings.js";
import type Command from "../commands.js";
import {Util} from "discord.js";
import * as bindings from "../bindings.js";
const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
const rawCommand: Command = {
	register(name: string): ApplicationCommandData {
		const description: string = "Tells you what is the datum of this type with this identifier";
		const options: ApplicationCommandOptionData[] = [
			{
				type: "STRING",
				name: "type",
				description: "Some type",
				required: true,
				choices: Object.keys(bindings).map((bindingName: string): [string, Binding] => {
					const binding: Binding = bindings[bindingName as keyof typeof bindings] as Binding;
					return [bindingName, binding];
				}).filter(([bindingName, binding]: [string, Binding]): boolean => {
					return binding.length !== 0;
				}).map(([bindingName, binding]: [string, Binding]): ApplicationCommandOptionChoiceData => {
					return {
						name: bindingName,
						value: bindingName,
					};
				}),
			},
			{
				type: "INTEGER",
				name: "identifier",
				description: "Some identifier",
				required: true,
				min_value: 0,
				minValue: 0,
			},
		];
		return {name, description, options};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {options}: CommandInteraction = interaction;
		const bindingName: string = options.getString("type", true);
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
		const identifier: number = options.getInteger("identifier", true);
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
	describe(interaction: CommandInteraction, name: string): string | null {
		return `Type \`/${name} Some type Some identifier\` to know what is the datum of \`Some type\` with \`Some identifier\``;
	},
};
export default rawCommand;
