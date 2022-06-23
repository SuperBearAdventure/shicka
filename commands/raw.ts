import discord from "discord.js";
import Command from "../command.js";
const {Util} = discord;
const conjunctionFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
export default class RawCommand extends Command {
	register(client, name) {
		const {data} = client;
		const description = "Tells you what is the datum of this type with this identifier";
		const options = [
			{
				type: "STRING",
				name: "type",
				description: "Some type",
				required: true,
				choices: Object.entries(data).filter(([type, array]) => {
					return array.length !== 0;
				}).map(([type, array]) => {
					return {
						name: type,
						value: type,
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
	}
	async execute(interaction) {
		const {client, options} = interaction;
		const {data} = client;
		const type = options.getString("type");
		if (!(type in data)) {
			const typeConjunction = conjunctionFormat.format(Object.keys(data).map((type) => {
				return `\`${Util.escapeMarkdown(type)}\``;
			}));
			await interaction.reply({
				content: `I do not know any datum with this name.\nPlease give me a type among ${typeConjunction} instead.`,
				ephemeral: true,
			});
			return;
		}
		const array = data[type];
		const identifier = options.getInteger("identifier");
		if (identifier < 0 || identifier >= array.length) {
			await interaction.reply({
				content: `I do not know any datum with this identifier.\nPlease give me an identifier between \`0\` and \`${array.length - 1}\` instead.`,
				ephemeral: true,
			});
			return;
		}
		const datum = JSON.stringify(array[identifier], null, "\t");
		await interaction.reply(`\`\`\`json\n${Util.escapeMarkdown(datum)}\n\`\`\``);
	}
	describe(interaction, name) {
		return `Type \`/${name} Some type Some identifier\` to know what is the datum of \`Some type\` with \`Some identifier\``;
	}
}
