import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type {Bear, Level, Outfit} from "../bindings.js";
import type Command from "../commands.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {bears, levels, outfits} from "../bindings.js";
import {compileAll, composeAll, localize, nearest, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
	bearOptionDescription: () => string,
};
type ReplyGroups = {
	name: () => string,
	level: () => string,
	outfitNameConjunction: () => string,
	goalConjunction: () => string,
};
type NoOutfitGroups = {};
type BossGoalGroups = {
	boss: () => string,
};
type CoinsGoalGroups = {
	coins: () => string,
};
type TimeGoalGroups = {
	time: () => string,
};
type NoGoalGroups = {};
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
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName> $<bearOptionDescription>` to know who is `$<bearOptionDescription>`",
	"fr": "Tape `/$<commandName> $<bearOptionDescription>` pour savoir qui est `$<bearOptionDescription>`",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "**$<name>** has been imprisoned in **$<level>** and is wearing $<outfitNameConjunction>.\n$<goalConjunction>!",
	"fr": "**$<name>** a été emprisonné·e dans **$<level>** et porte $<outfitNameConjunction>.\n$<goalConjunction> !",
});
const noOutfitLocalizations: Localized<(groups: NoOutfitGroups) => string> = compileAll<NoOutfitGroups>({
	"en-US": "the bare minimum",
	"fr": "le plus simple appareil",
});
const bossGoalLocalizations: Localized<(groups: BossGoalGroups) => string> = compileAll<BossGoalGroups>({
	"en-US": "Beat **$<boss>**",
	"fr": "Bats **$<boss>**",
});
const coinsWithBossGoalLocalizations: Localized<(groups: CoinsGoalGroups) => string> = compileAll<CoinsGoalGroups>({
	"en-US": "collect **$<coins> coins**",
	"fr": "collecte **$<coins> pièces**",
});
const coinsWithoutBossGoalLocalizations: Localized<(groups: CoinsGoalGroups) => string> = compileAll<CoinsGoalGroups>({
	"en-US": "Collect **$<coins> coins**",
	"fr": "Collecte **$<coins> pièces**",
});
const timeWithBossOrCoinsGoalLocalizations: Localized<(groups: TimeGoalGroups) => string> = compileAll<TimeGoalGroups>({
	"en-US": "unlock the cage in less than **$<time>** to beat the gold time",
	"fr": "déverrouille la cage en moins de **$<time>** pour battre le temps d'or",
});
const timeWithoutBossAndCoinsGoalLocalizations: Localized<(groups: TimeGoalGroups) => string> = compileAll<TimeGoalGroups>({
	"en-US": "Unlock the cage in less than **$<time>** to beat the gold time",
	"fr": "Déverrouille la cage en moins de **$<time>** pour battre le temps d'or",
});
const noGoalLocalizations: Localized<(groups: NoGoalGroups) => string> = compileAll<NoGoalGroups>({
	"en-US": "Let's go",
	"fr": "En route",
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
		const {locale, options}: CommandInteraction = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const id: number = options.getInteger(bearOptionName, true);
		const bear: Bear = bears[id];
		const {gold, name}: Bear = bear;
		const level: Level = levels[bear.level];
		const bearOutfits: Outfit[] = bear.outfits.filter((outfit: number): boolean => {
			const {name}: Outfit = outfits[outfit];
			return name["en-US"] !== "Default";
		}).map<Outfit>((outfit: number): Outfit => {
			return outfits[outfit];
		});
		const boss: Localized<string> | null = bear.id % 8 === 0 ? levels[bear.level].boss : null;
		const coins: number | null = bear.id % 8 === 3 ? levels[bear.level].coins - 25 : 0;
		const bossGoal: Localized<(groups: {}) => string> | null = boss != null ? composeAll<BossGoalGroups, {}>(bossGoalLocalizations, localize<BossGoalGroups>((locale: keyof Localized<unknown>): BossGoalGroups => {
			return {
				boss: (): string => {
					return Util.escapeMarkdown(boss[locale]);
				},
			};
		})) : null;
		const coinsGoal: Localized<(groups: {}) => string> | null = coins !== 0 ? composeAll<CoinsGoalGroups, {}>(bossGoal != null ? coinsWithBossGoalLocalizations : coinsWithoutBossGoalLocalizations, localize<CoinsGoalGroups>((): CoinsGoalGroups => {
			return {
				coins: (): string => {
					return Util.escapeMarkdown(`${coins}`);
				},
			};
		})) : null;
		const minutes: string = `${gold / 60 | 0}`.padStart(2, "0");
		const seconds: string = `${gold % 60 | 0}`.padStart(2, "0");
		const centiseconds: string = `${gold * 100 % 100 | 0}`.padStart(2, "0");
		const time: string = `${minutes}:${seconds}.${centiseconds}`;
		const timeGoal: Localized<(groups: {}) => string> | null = time !== "00:00.00" ? composeAll<TimeGoalGroups, {}>(bossGoal != null || coinsGoal != null ? timeWithBossOrCoinsGoalLocalizations : timeWithoutBossAndCoinsGoalLocalizations, localize<TimeGoalGroups>((): TimeGoalGroups => {
			return {
				time: (): string => {
					return Util.escapeMarkdown(time);
				},
			};
		})) : null;
		const goals: Localized<(groups: {}) => string>[] = [bossGoal, coinsGoal, timeGoal].filter((goal: Localized<(groups: {}) => string> | null): goal is Localized<(groups: {}) => string> => {
			return goal != null;
		});
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				name: (): string => {
					return Util.escapeMarkdown(name["en-US"]);
				},
				level: (): string => {
					return Util.escapeMarkdown(level.name["en-US"]);
				},
				outfitNameConjunction: (): string => {
					if (bearOutfits.length !== 0) {
						const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
							style: "long",
							type: "conjunction",
						});
						return conjunctionFormat.format(bearOutfits.map<string>((outfit: Outfit): string => {
							return `*${Util.escapeMarkdown(outfit.name["en-US"])}*`;
						}));
					}
					return Util.escapeMarkdown(noOutfitLocalizations["en-US"]({}));
				},
				goalConjunction: (): string => {
					if (goals.length !== 0) {
						const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
							style: "long",
							type: "conjunction",
						});
						return conjunctionFormat.format(goals.map<string>((goal: Localized<(groups: {}) => string>): string => {
							return goal["en-US"]({});
						}));
					}
					return Util.escapeMarkdown(noGoalLocalizations["en-US"]({}));
				},
			}),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: replyLocalizations[resolvedLocale]({
				name: (): string => {
					return Util.escapeMarkdown(name[resolvedLocale]);
				},
				level: (): string => {
					return Util.escapeMarkdown(level.name[resolvedLocale]);
				},
				outfitNameConjunction: (): string => {
					if (bearOutfits.length !== 0) {
						const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(resolvedLocale, {
							style: "long",
							type: "conjunction",
						});
						return conjunctionFormat.format(bearOutfits.map<string>((outfit: Outfit): string => {
							return `*${Util.escapeMarkdown(outfit.name[resolvedLocale])}*`;
						}));
					}
					return Util.escapeMarkdown(noOutfitLocalizations[resolvedLocale]({}));
				},
				goalConjunction: (): string => {
					if (goals.length !== 0) {
						const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(resolvedLocale, {
							style: "long",
							type: "conjunction",
						});
						return conjunctionFormat.format(goals.map<string>((goal: Localized<(groups: {}) => string>): string => {
							return goal[resolvedLocale]({});
						}));
					}
					return Util.escapeMarkdown(noGoalLocalizations[resolvedLocale]({}));
				},
			}),
			ephemeral: true,
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
