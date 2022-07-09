import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type {Bear, Outfit} from "../bindings.js";
import type Command from "../commands.js";
import {Util} from "discord.js";
import {bears, levels, outfits} from "../bindings.js";
import {nearest} from "../utils/string.js";
const commandNameLocalizations: {[k: string]: string} = {
	"en-US": "bear",
	"fr": "ours",
};
const commandName: string = commandNameLocalizations["en-US"];
const commandDescriptionLocalizations: {[k: string]: string} = {
	"en-US": "Tells you who is this bear",
	"fr": "Te dit qui est cet ours",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const bearOptionNameLocalizations: {[k: string]: string} = {
	"en-US": "bear",
	"fr": "ours",
};
const bearOptionName: string = bearOptionNameLocalizations["en-US"];
const bearOptionDescriptionLocalizations: {[k: string]: string} = {
	"en-US": "Some bear",
	"fr": "Un ours",
};
const bearOptionDescription: string = bearOptionDescriptionLocalizations["en-US"];
const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandNameLocalizations["en-US"]} ${bearOptionDescriptionLocalizations["en-US"]}\` to know who is \`${bearOptionDescriptionLocalizations["en-US"]}\``;
		},
		"fr"(): string {
			return `Tape \`/${commandNameLocalizations["fr"]} ${bearOptionDescriptionLocalizations["fr"]}\` pour savoir qui est \`${bearOptionDescriptionLocalizations["fr"]}\``;
		},
	});
}
const bearCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			nameLocalizations: commandNameLocalizations,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
			options: [
				{
					type: "STRING",
					name: bearOptionName,
					nameLocalizations: bearOptionNameLocalizations,
					description: bearOptionDescription,
					descriptionLocalizations: bearOptionDescriptionLocalizations,
					required: true,
					autocomplete: true,
				},
			],
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (interaction.isAutocomplete()) {
			const {options}: AutocompleteInteraction = interaction;
			const {name, value}: AutocompleteFocusedOption = options.getFocused(true);
			if (name !== bearOptionName) {
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
		const search: string = options.getString(bearOptionName, true);
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
		const level: string = levels[bear.level].name["en-US"];
		const names: string[] = bear.outfits.filter((outfit: number): boolean => {
			const {name}: Outfit = outfits[outfit];
			return name["en-US"] !== "Default";
		}).map((outfit: number): string => {
			const {name}: Outfit = outfits[outfit];
			return `*${Util.escapeMarkdown(name["en-US"])}*`;
		});
		const nameConjunction: string = names.length !== 0 ? conjunctionFormat.format(names) : "nothing";
		const boss: string | null = bear.id % 8 === 0 ? levels[bear.level].boss["en-US"] : null;
		const coins: number | null = bear.id % 8 === 3 ? levels[bear.level].coins - 25 : 0;
		const goal: string = boss != null ? `Beat **${Util.escapeMarkdown(boss)}** and unlock` : coins !== 0 ? `Collect **${Util.escapeMarkdown(`${coins}`)} coin${coins !== 1 ? "s" : ""}** and unlock` : `Unlock`;
		const minutes: string = `${gold / 60 | 0}`.padStart(2, "0");
		const seconds: string = `${gold % 60 | 0}`.padStart(2, "0");
		const centiseconds: string = `${gold * 100 % 100 | 0}`.padStart(2, "0");
		const time: string = `${minutes}:${seconds}.${centiseconds}`;
		await interaction.reply(`**${Util.escapeMarkdown(name)}** has been imprisoned in the **${Util.escapeMarkdown(level)}** and is wearing ${nameConjunction}.\n${goal} the cage in less than **${Util.escapeMarkdown(time)}** to beat the gold time!`);
	},
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		return computeHelpLocalizations();
	},
};
export default bearCommand;
