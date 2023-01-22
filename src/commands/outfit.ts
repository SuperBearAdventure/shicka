import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type {Outfit, Rarity} from "../bindings.js";
import type Command from "../commands.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {outfits, rarities} from "../bindings.js";
import {outfitsByRarity} from "../indices.js";
import {compileAll, composeAll, list, localize, nearest, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
	outfitOptionDescription: () => string,
};
type ReplyGroups = {
	outfitName: () => string,
	costConjunction: () => string,
	scheduleList: () => string,
};
type BareReplyGroups = {
	scheduleList: () => string,
};
type NoSlotReplyGroups = {
	outfitName: () => string,
};
type TokensCostGroups = {
	tokens: () => string,
};
type CoinsCostGroups = {
	coins: () => string,
};
type NoCostGroups = {};
type ScheduleGroups = {
	dayDateTime: () => string,
};
type BareScheduleGroups = {
	dayDateTime: () => string,
	outfitNameConjunction: () => string,
};
const {
	SHICKA_SALT: salt = "",
}: NodeJS.ProcessEnv = process.env;
const commandName: string = "outfit";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you what is for sale in the shop or when it is for sale",
	"fr": "Te dit ce qui est en vente dans la boutique ou quand c'est en vente",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const outfitOptionName: string = "outfit";
const outfitOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some outfit",
	"fr": "Un costume",
};
const outfitOptionDescription: string = outfitOptionDescriptionLocalizations["en-US"];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know what is for sale in the shop\nType `/$<commandName> $<outfitOptionDescription>` to know when `$<outfitOptionDescription>` is for sale in the shop",
	"fr": "Tape `/$<commandName>` pour savoir ce qui est en vente dans la boutique\nTape `/$<commandName> $<outfitOptionDescription>` pour savoir quand `$<outfitOptionDescription>` est en vente dans la boutique",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "**$<outfitName>** will be for sale in the shop for $<costConjunction> for 6 hours starting:\n$<scheduleList>",
	"fr": "**$<outfitName>** sera en vente dans la boutique pour $<costConjunction> durant 6 heures à partir de :\n$<scheduleList>",
});
const noSlotReplyLocalizations: Localized<(groups: NoSlotReplyGroups) => string> = compileAll<NoSlotReplyGroups>({
	"en-US": "**$<outfitName>** is not for sale.",
	"fr": "**$<outfitName>** n'est pas en vente.",
});
const bareReplyLocalizations: Localized<(groups: BareReplyGroups) => string> = compileAll<BareReplyGroups>({
	"en-US": "The outfits for sale in the shop change every 6 hours:\n$<scheduleList>",
	"fr": "Les costumes en vente dans la boutique changent toutes les 6 heures :\n$<scheduleList>",
});
const tokensCostLocalizations: Localized<(groups: TokensCostGroups) => string> = compileAll<TokensCostGroups>({
	"en-US": "**$<tokens> Tristopio tokens**",
	"fr": "**$<tokens> jetons Tristopio**",
});
const coinsCostLocalizations: Localized<(groups: CoinsCostGroups) => string> = compileAll<CoinsCostGroups>({
	"en-US": "**$<coins> coins**",
	"fr": "**$<coins> pièces**",
});
const noCostLocalizations: Localized<(groups: NoCostGroups) => string> = compileAll<NoCostGroups>({
	"en-US": "a pittance",
	"fr": "une bouchée de pain",
});
const scheduleLocalizations: Localized<((groups: ScheduleGroups) => string)> = compileAll<ScheduleGroups>({
	"en-US": "*$<dayDateTime>*",
	"fr": "*$<dayDateTime>*",
});
const bareScheduleLocalizations: Localized<((groups: BareScheduleGroups) => string)> = compileAll<BareScheduleGroups>({
	"en-US": "*$<dayDateTime>*: $<outfitNameConjunction>",
	"fr": "*$<dayDateTime>* : $<outfitNameConjunction>",
});
function knuth(state: bigint): bigint {
	return BigInt.asUintN(32, state * 2654435761n);
}
function* xorShift32(seed: bigint): Generator<bigint> {
	let t: bigint = BigInt.asUintN(32, seed);
	for (;;) {
		t = BigInt.asUintN(32, t ^ BigInt.asUintN(32, t << 13n));
		t = BigInt.asUintN(32, t ^ BigInt.asUintN(32, t >> 17n));
		t = BigInt.asUintN(32, t ^ BigInt.asUintN(32, t << 5n));
		yield t;
	}
}
function shuffle<Type>(generator: Iterator<bigint>, outfits: Type[]): void {
	for (let i: number = outfits.length - 1; i > 0; --i) {
		const j: number = Number(generator.next().value * BigInt(i + 1) >> 32n);
		[outfits[i], outfits[j]] = [outfits[j], outfits[i]];
	}
}
function sliceOutfits(generator: Iterator<bigint>, outfits: Outfit[], outfitsPerSlice: number, slicesPerRarity: number): Outfit[][] {
	outfits = outfits.slice();
	const slices: Outfit[][] = [];
	const stash: Set<Outfit> = new Set<Outfit>();
	const outfitsPerShuffle: number = outfits.length;
	const slicesPerShuffle: number = Math.floor(outfitsPerShuffle / outfitsPerSlice);
	const remainingOutfitsCount: number = outfitsPerShuffle % outfitsPerSlice;
	for (let i: number = 0; i < slicesPerRarity; i += slicesPerShuffle) {
		shuffle<Outfit>(generator, outfits);
		const overflow: Outfit[] = [];
		const remainingSlicesCount: number = Math.min(slicesPerRarity - i, slicesPerShuffle);
		let j: number = 0;
		for (let k: number = 0; k < remainingSlicesCount - 1; ++k) {
			while (overflow.length < remainingOutfitsCount && !stash.has(outfits[j])) {
				overflow.push(outfits[j++]);
			}
			const slice: Outfit[] = [];
			for (let l: number = 0; l < outfitsPerSlice; ++l) {
				const outfit: Outfit = outfits[j++];
				slice.push(outfit)
				stash.delete(outfit);
			}
			slices.push(slice);
		}
		const slice: Outfit[] = [...stash.keys()];
		while (slice.length < outfitsPerSlice) {
			const outfit: Outfit = outfits[j++];
			if (!stash.has(outfit)) {
				slice.push(outfit);
			}
		}
		stash.clear();
		slices.push(slice);
		for (const outfit of overflow) {
			stash.add(outfit);
		}
	}
	shuffle<Outfit[]>(generator, slices);
	return slices;
}
const outfitCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
			options: [
				((): ApplicationCommandOptionData & {minValue: number, maxValue: number} => ({
					type: "INTEGER",
					name: outfitOptionName,
					description: outfitOptionDescription,
					descriptionLocalizations: outfitOptionDescriptionLocalizations,
					minValue: 0,
					maxValue: outfits.length - 1,
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
			if (name !== outfitOptionName) {
				await interaction.respond([]);
				return;
			}
			const results: Outfit[] = nearest<Outfit>(value.toLowerCase(), outfits, 7, (outfit: Outfit): string => {
				const {name}: Outfit = outfit;
				const outfitName: string = name[resolvedLocale];
				return outfitName.toLowerCase();
			});
			const suggestions: ApplicationCommandOptionChoiceData[] = results.map<ApplicationCommandOptionChoiceData>((outfit: Outfit): ApplicationCommandOptionChoiceData => {
				const {id, name}: Outfit = outfit;
				const outfitName: string = name[resolvedLocale];
				return {
					name: outfitName,
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
		const slicesByRarityBySeed: {[k in string]: Outfit[][][]} = Object.create(null);
		const slicesPerRarity: number = Math.ceil(Math.max(...rarities.map<number>((rarity: Rarity): number => {
			if (rarity.slots === 0) {
				return 0;
			}
			return outfitsByRarity[rarity.id].length / rarity.slots;
		})));
		const now: number = Math.floor(interaction.createdTimestamp / 21600000);
		const id: number | null = options.getInteger(outfitOptionName);
		if (id == null) {
		const schedules: Localized<(groups: {}) => string>[] = [];
		for (let k: number = -2; k < 4; ++k) {
			const day: number = now + k;
			const seed: number = Math.floor(day / slicesPerRarity);
			const slicesByRarity: Outfit[][][] = slicesByRarityBySeed[seed] ??= ((): Outfit[][][] => {
				const generator: Iterator<bigint> = xorShift32(knuth(BigInt(seed) + BigInt(salt)) || BigInt(salt));
				return rarities.map<Outfit[][]>((rarity: Rarity): Outfit[][] => {
					if (rarity.slots === 0) {
						const length: number = slicesPerRarity;
						return Array.from({length}, (): Outfit[] => {
							return [];
						});
					}
					return sliceOutfits(generator, outfitsByRarity[rarity.id], rarity.slots, slicesPerRarity);
				});
			})();
			const index: number = day - seed * slicesPerRarity;
			const scheduleOutfits: Outfit[] = slicesByRarity.map<Outfit[]>((slices: Outfit[][]): Outfit[] => {
				return slices[index];
			}).flat<Outfit[][]>();
			const dayDateTime: Date = new Date(day * 21600000);
			const schedule: Localized<(groups: {}) => string> = composeAll<BareScheduleGroups, {}>(bareScheduleLocalizations, localize<BareScheduleGroups>((locale: keyof Localized<unknown>): BareScheduleGroups => {
				return {
					dayDateTime: (): string => {
						const dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
							dateStyle: "long",
							timeStyle: "short",
							timeZone: "UTC",
						});
						return Util.escapeMarkdown(dateTimeFormat.format(dayDateTime));
					},
					outfitNameConjunction: (): string => {
						const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(locale, {
							style: "long",
							type: "conjunction",
						});
						return conjunctionFormat.format(scheduleOutfits.map<string>((outfit: Outfit): string => {
							return `**${Util.escapeMarkdown(outfit.name[locale])}**`;
						}));
					},
				};
			}));
			schedules.push(schedule);
		}
		await interaction.reply({
			content: bareReplyLocalizations["en-US"]({
				scheduleList: (): string => {
					return list(schedules.map<string>((schedule: Localized<(groups: {}) => string>): string => {
						return schedule["en-US"]({});
					}));
				},
			}),
		});
		return;
		}
		const outfit: Outfit = outfits[id];
		if (rarities[outfit.rarity].slots === 0) {
			await interaction.reply({
				content: noSlotReplyLocalizations["en-US"]({
					outfitName: (): string => {
						return Util.escapeMarkdown(outfit.name["en-US"]);
					},
				}),
			});
			return;
		}
		const schedules: Localized<(groups: {}) => string>[] = [];
		for (let k: number = -2; k < 4 || schedules.length < 2; ++k) {
			const day: number = now + k;
			const seed: number = Math.floor(day / slicesPerRarity);
			const slicesByRarity: Outfit[][][] = slicesByRarityBySeed[seed] ??= ((): Outfit[][][] => {
				const generator: Iterator<bigint> = xorShift32(knuth(BigInt(seed) + BigInt(salt)) || BigInt(salt));
				return rarities.map<Outfit[][]>((rarity: Rarity): Outfit[][] => {
					if (rarity.slots === 0) {
						return [];
					}
					return sliceOutfits(generator, outfitsByRarity[rarity.id], rarity.slots, slicesPerRarity);
				});
			})();
			const index: number = day - seed * slicesPerRarity;
			if (slicesByRarity[outfit.rarity][index].includes(outfit)) {
				const dayDateTime: Date = new Date(day * 21600000);
				const schedule: Localized<(groups: {}) => string> = composeAll<ScheduleGroups, {}>(scheduleLocalizations, localize<ScheduleGroups>((locale: keyof Localized<unknown>): ScheduleGroups => {
					return {
						dayDateTime: (): string => {
							const dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
								dateStyle: "long",
								timeStyle: "short",
								timeZone: "UTC",
							});
							return Util.escapeMarkdown(dateTimeFormat.format(dayDateTime));
						},
					};
				}));
				schedules.push(schedule);
			}
		}
		const tokens: number = outfit.cost;
		const tokensCost: Localized<(groups: {}) => string> | null = tokens !== 0 ? composeAll<TokensCostGroups, {}>(tokensCostLocalizations, localize<TokensCostGroups>((): TokensCostGroups => {
			return {
				tokens: (): string => {
					return Util.escapeMarkdown(`${tokens}`);
				},
			};
		})) : null;
		const coins: number = rarities[outfit.rarity].cost;
		const coinsCost: Localized<(groups: {}) => string> | null = coins !== 0 ? composeAll<CoinsCostGroups, {}>(coinsCostLocalizations, localize<CoinsCostGroups>((): CoinsCostGroups => {
			return {
				coins: (): string => {
					return Util.escapeMarkdown(`${coins}`);
				},
			};
		})) : null;
		const costs: Localized<(groups: {}) => string>[] = [tokensCost, coinsCost].filter((cost: Localized<(groups: {}) => string> | null): cost is Localized<(groups: {}) => string> => {
			return cost != null;
		});
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				outfitName: (): string => {
					return Util.escapeMarkdown(outfit.name["en-US"]);
				},
				costConjunction: (): string => {
					if (costs.length !== 0) {
						const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
							style: "long",
							type: "conjunction",
						});
						return conjunctionFormat.format(costs.map<string>((cost: Localized<(groups: {}) => string>): string => {
							return cost["en-US"]({});
						}));
					}
					return Util.escapeMarkdown(noCostLocalizations["en-US"]({}));
				},
				scheduleList: (): string => {
					return list(schedules.map<string>((schedule: Localized<(groups: {}) => string>): string => {
						return schedule["en-US"]({})
					}));
				},
			}),
		});
	},
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: keyof Localized<unknown>): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
				outfitOptionDescription: (): string => {
					return outfitOptionDescriptionLocalizations[locale];
				},
			};
		}));
	},
};
export default outfitCommand;
