import {Util} from "discord.js";
import * as bindings from "../bindings.js";
const conjunctionFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
const rawCommand = {
	register(name) {
		const description = "Tells you what is the datum of this type with this identifier";
		const options = [
			{
				type: "STRING",
				name: "type",
				description: "Some type",
				required: true,
				choices: Object.keys(bindings).map((bindingName) => {
					const binding = bindings[bindingName];
					return [bindingName, binding];
				}).filter(([bindingName, binding]) => {
					return binding.length !== 0;
				}).map(([bindingName, binding]) => {
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
	async execute(interaction) {
		if (!interaction.isCommand()) {
			return;
		}
		const {options} = interaction;
		const bindingName = options.getString("type", true);
		if (!(bindingName in bindings)) {
			const typeConjunction = conjunctionFormat.format(Object.keys(bindings).map((bindingName) => {
				return `\`${Util.escapeMarkdown(bindingName)}\``;
			}));
			await interaction.reply({
				content: `I do not know any datum with this name.\nPlease give me a type among ${typeConjunction} instead.`,
				ephemeral: true,
			});
			return;
		}
		const binding = bindings[bindingName];
		const identifier = options.getInteger("identifier", true);
		if (identifier < 0 || identifier >= binding.length) {
			await interaction.reply({
				content: `I do not know any datum with this identifier.\nPlease give me an identifier between \`0\` and \`${binding.length - 1}\` instead.`,
				ephemeral: true,
			});
			return;
		}
		const datum = JSON.stringify(binding[identifier], null, "\t");
		await interaction.reply(`\`\`\`json\n${Util.escapeMarkdown(datum)}\n\`\`\``);
	},
	describe(interaction, name) {
		return `Type \`/${name} Some type Some identifier\` to know what is the datum of \`Some type\` with \`Some identifier\``;
	},
};
export default rawCommand;
