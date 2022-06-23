import discord from "discord.js";
import Command from "../command.js";
import {nearest} from "../utils/string.js"
const {Util} = discord;
const conjunctionFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
export default class BearCommand extends Command {
	register(client, name) {
		const description = "Tells you who is this bear";
		const options = [
			{
				type: "STRING",
				name: "bear",
				description: "Some bear",
				required: true,
				autocomplete: true,
			},
		];
		return {name, description, options};
	}
	async execute(interaction) {
		if (interaction.isAutocomplete()) {
			const {client, options} = interaction;
			const {bindings} = client;
			const {bears} = bindings;
			const {name, value} = options.getFocused(true);
			if (name !== "bear") {
				await interaction.respond([]);
				return;
			}
			const results = nearest(value.toLowerCase(), bears, 7, (bear) => {
				const {name} = bear;
				return name.toLowerCase();
			});
			const suggestions = results.map((bear) => {
				const {name} = bear;
				return {
					name: name,
					value: name,
				};
			});
			await interaction.respond(suggestions);
			return;
		}
		const {client, options} = interaction;
		const {bindings} = client;
		const {bears, levels, outfits} = bindings;
		const search = options.getString("bear");
		const results = nearest(search.toLowerCase(), bears, 1, (bear) => {
			const {name} = bear;
			return name.toLowerCase();
		});
		if (results.length === 0) {
			await interaction.reply({
				content: `I do not know any bear with this name.`,
				ephemeral: true,
			});
			return;
		}
		const bear = results[0];
		const {gold, name} = bear;
		const level = levels[bear.level].name;
		const names = bear.outfits.filter((outfit) => {
			const {name} = outfits[outfit];
			return name !== "Default";
		}).map((outfit) => {
			const {name} = outfits[outfit];
			return `*${Util.escapeMarkdown(name)}*`;
		});
		const nameConjunction = names.length !== 0 ? conjunctionFormat.format(names) : "nothing";
		const boss = bear.id % 8 === 0 ? levels[bear.level].boss : null;
		const coins = bear.id % 8 === 3 ? levels[bear.level].coins - 25 : 0;
		const goal = boss != null ? `Beat **${Util.escapeMarkdown(boss)}** and unlock` : coins !== 0 ? `Collect **${Util.escapeMarkdown(`${coins}`)} coin${coins !== 1 ? "s" : ""}** and unlock` : `Unlock`;
		const minutes = `${gold / 60 | 0}`.padStart(2, "0");
		const seconds = `${gold % 60 | 0}`.padStart(2, "0");
		const centiseconds = `${gold * 100 % 100 | 0}`.padStart(2, "0");
		const time = `${minutes}:${seconds}.${centiseconds}`;
		await interaction.reply(`**${Util.escapeMarkdown(name)}** has been imprisoned in the **${Util.escapeMarkdown(level)}** and is wearing ${nameConjunction}.\n${goal} the cage in less than **${Util.escapeMarkdown(time)}** to beat the gold time!`);
	}
	describe(interaction, name) {
		return `Type \`/${name} Some bear\` to know who is \`Some bear\``;
	}
}
