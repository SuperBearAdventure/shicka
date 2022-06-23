import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type {Bear, Outfit} from "../bindings.js";
import type Command from "../commands.js";
import {Util} from "discord.js";
import {bears, levels, outfits} from "../bindings.js";
import {nearest} from "../utils/string.js"
const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
const bearCommand: Command = {
	register(name: string): ApplicationCommandData {
		const description: string = "Tells you who is this bear";
		const options: ApplicationCommandOptionData[] = [
			{
				type: "STRING",
				name: "bear",
				description: "Some bear",
				required: true,
				autocomplete: true,
			},
		];
		return {name, description, options};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (interaction.isAutocomplete()) {
			const {options}: AutocompleteInteraction = interaction;
			const {name, value}: AutocompleteFocusedOption = options.getFocused(true);
			if (name !== "bear") {
				await interaction.respond([]);
				return;
			}
			const results: Bear[] = nearest<Bear>(value.toLowerCase(), bears, 7, (bear: Bear): string => {
				const {name}: Bear = bear;
				return name.toLowerCase();
			});
			const suggestions: ApplicationCommandOptionChoiceData[] = results.map((bear: Bear): ApplicationCommandOptionChoiceData => {
				const {name}: Bear = bear;
				return {
					name: name,
					value: name,
				};
			});
			await interaction.respond(suggestions);
			return;
		}
		if (!interaction.isCommand()) {
			return;
		}
		const {options}: CommandInteraction = interaction;
		const search: string = options.getString("bear", true);
		const results: Bear[] = nearest<Bear>(search.toLowerCase(), bears, 1, (bear: Bear): string => {
			const {name}: Bear = bear;
			return name.toLowerCase();
		});
		if (results.length === 0) {
			await interaction.reply({
				content: `I do not know any bear with this name.`,
				ephemeral: true,
			});
			return;
		}
		const bear: Bear = results[0];
		const {gold, name}: Bear = bear;
		const level: string = levels[bear.level].name;
		const names: string[] = bear.outfits.filter((outfit: number): boolean => {
			const {name}: Outfit = outfits[outfit];
			return name !== "Default";
		}).map((outfit: number): string => {
			const {name}: Outfit = outfits[outfit];
			return `*${Util.escapeMarkdown(name)}*`;
		});
		const nameConjunction: string = names.length !== 0 ? conjunctionFormat.format(names) : "nothing";
		const boss: string | null = bear.id % 8 === 0 ? levels[bear.level].boss : null;
		const coins: number | null = bear.id % 8 === 3 ? levels[bear.level].coins - 25 : 0;
		const goal: string = boss != null ? `Beat **${Util.escapeMarkdown(boss)}** and unlock` : coins !== 0 ? `Collect **${Util.escapeMarkdown(`${coins}`)} coin${coins !== 1 ? "s" : ""}** and unlock` : `Unlock`;
		const minutes: string = `${gold / 60 | 0}`.padStart(2, "0");
		const seconds: string = `${gold % 60 | 0}`.padStart(2, "0");
		const centiseconds: string = `${gold * 100 % 100 | 0}`.padStart(2, "0");
		const time: string = `${minutes}:${seconds}.${centiseconds}`;
		await interaction.reply(`**${Util.escapeMarkdown(name)}** has been imprisoned in the **${Util.escapeMarkdown(level)}** and is wearing ${nameConjunction}.\n${goal} the cage in less than **${Util.escapeMarkdown(time)}** to beat the gold time!`);
	},
	describe(interaction: CommandInteraction, name: string): string | null {
		return `Type \`/${name} Some bear\` to know who is \`Some bear\``;
	},
};
export default bearCommand;
