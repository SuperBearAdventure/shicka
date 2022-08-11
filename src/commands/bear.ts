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
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {bears, levels, outfits} from "../bindings.js";
import {compileAll, composeAll, localize, nearest, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
	bearOptionDescription: () => string,
};
const commandName: string = "bear";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you who is this bear",
	"fr": "Te dit qui est cet ours",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const bearOptionName: string = "bear";
const bearOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some bear",
	"fr": "Un ours",
};
const bearOptionDescription: string = bearOptionDescriptionLocalizations["en-US"];
const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName> $<bearOptionDescription>` to know who is `$<bearOptionDescription>`",
	"fr": "Tape `/$<commandName> $<bearOptionDescription>` pour savoir qui est `$<bearOptionDescription>`",
});
const bearCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
			options: [
				((): ApplicationCommandOptionData & {minValue: number, maxValue: number} => ({
					type: "INTEGER",
					name: bearOptionName,
					description: bearOptionDescription,
					descriptionLocalizations: bearOptionDescriptionLocalizations,
					required: true,
					minValue: 0,
					maxValue: bears.length - 1,
					autocomplete: true,
				}))(),
			],
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (interaction.isAutocomplete()) {
			const {locale, options}: AutocompleteInteraction = interaction;
			const resolvedLocale: Locale = resolve(locale);
			const {name, value}: AutocompleteFocusedOption = options.getFocused(true);
			if (name !== bearOptionName) {
				await interaction.respond([]);
				return;
			}
			const results: Bear[] = nearest<Bear>(value.toLowerCase(), bears, 7, (bear: Bear): string => {
				const {name}: Bear = bear;
				const bearName: string = name[resolvedLocale];
				return bearName.toLowerCase();
			});
			const suggestions: ApplicationCommandOptionChoiceData[] = results.map<ApplicationCommandOptionChoiceData>((bear: Bear): ApplicationCommandOptionChoiceData => {
				const {id, name}: Bear = bear;
				const bearName: string = name[resolvedLocale];
				return {
					name: bearName,
					value: id,
				};
			});
			await interaction.respond(suggestions);
			return;
		}
		if (!interaction.isCommand()) {
			return;
		}
		const {options}: CommandInteraction = interaction;
		const id: number = options.getInteger(bearOptionName, true);
		const bear: Bear = bears[id];
		const {gold, name}: Bear = bear;
		const level: string = levels[bear.level].name["en-US"];
		const names: string[] = bear.outfits.filter((outfit: number): boolean => {
			const {name}: Outfit = outfits[outfit];
			return name["en-US"] !== "Default";
		}).map<string>((outfit: number): string => {
			const {name}: Outfit = outfits[outfit];
			return `*${Util.escapeMarkdown(name["en-US"])}*`;
		});
		const nameConjunction: string = names.length !== 0 ? conjunctionFormat.format(names) : "nothing";
		const boss: string | null = bear.id % 8 === 0 ? levels[bear.level].boss["en-US"] : null;
		const coins: number | null = bear.id % 8 === 3 ? levels[bear.level].coins - 25 : 0;
		const bossGoal: string | null = boss != null ? `Beat **${Util.escapeMarkdown(boss)}**` : null;
		const coinsGoal: string | null = coins !== 0 ? `${bossGoal != null ? "collect" : "Collect"} **${Util.escapeMarkdown(`${coins}`)} coin${coins !== 1 ? "s" : ""}**` : null;
		const minutes: string = `${gold / 60 | 0}`.padStart(2, "0");
		const seconds: string = `${gold % 60 | 0}`.padStart(2, "0");
		const centiseconds: string = `${gold * 100 % 100 | 0}`.padStart(2, "0");
		const time: string = `${minutes}:${seconds}.${centiseconds}`;
		const timeGoal: string | null = time !== "00:00.00" ? `${bossGoal != null || coinsGoal != null ? "unlock" : "Unlock"} the cage in less than **${Util.escapeMarkdown(time)}** to beat the gold time` : null;
		const goals: string[] = [bossGoal, coinsGoal, timeGoal].filter((goal: string | null): goal is string => {
			return goal != null;
		});
		const goalConjunction: string = goals.length !== 0 ? conjunctionFormat.format(goals) : "Let's go";
		await interaction.reply({
			content: `**${Util.escapeMarkdown(name["en-US"])}** has been imprisoned in the **${Util.escapeMarkdown(level)}** and is wearing ${nameConjunction}.\n${goalConjunction}!`,
		});
	},
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: keyof Localized<unknown>): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
				bearOptionDescription: (): string => {
					return bearOptionDescriptionLocalizations[locale];
				},
			};
		}));
	},
};
export default bearCommand;
