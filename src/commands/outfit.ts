import type {
	ApplicationCommand,
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	Interaction,
} from "discord.js";
import type {Outfit, Rarity} from "../bindings.js";
import type Command from "../commands.js";
import type {Outfit as OutfitCompilation} from "../compilations.js";
import type {Outfit as OutfitDefinition} from "../definitions.js";
import type {Outfit as OutfitDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ApplicationCommandOptionType,
	escapeMarkdown,
} from "discord.js";
import {outfits, rarities} from "../bindings.js";
import {outfit as outfitCompilation} from "../compilations.js";
import {outfit as outfitDefinition} from "../definitions.js";
import {outfitsByRarity} from "../indices.js";
import {composeAll, list, localize, nearest, resolve} from "../utils/string.js";
type HelpGroups = OutfitDependency["help"];
type TokensCostGroups = OutfitDependency["tokensCost"];
type CoinsCostGroups = OutfitDependency["coinsCost"];
type ScheduleGroups = OutfitDependency["schedule"];
type BareScheduleGroups = OutfitDependency["bareSchedule"];
const {
	commandName,
	commandDescription,
	outfitOptionName,
	outfitOptionDescription,
}: OutfitDefinition = outfitDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	bareReply: bareReplyLocalizations,
	noSlotReply: noSlotReplyLocalizations,
	tokensCost: tokensCostLocalizations,
	coinsCost: coinsCostLocalizations,
	noCost: noCostLocalizations,
	schedule: scheduleLocalizations,
	bareSchedule: bareScheduleLocalizations,
}: OutfitCompilation = outfitCompilation;
const {
	SHICKA_SALT: salt = "",
}: NodeJS.ProcessEnv = process.env;
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
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: outfitOptionName,
					description: outfitOptionDescription["en-US"],
					descriptionLocalizations: outfitOptionDescription,
					minValue: 0,
					maxValue: outfits.length - 1,
					autocomplete: true,
				},
			],
		};
	},
	async execute(interaction: Interaction<"cached">): Promise<void> {
		if (interaction.isAutocomplete()) {
			const {locale, options}: AutocompleteInteraction<"cached"> = interaction;
			const resolvedLocale: Locale = resolve(locale);
			const {name, value}: AutocompleteFocusedOption = options.getFocused(true);
			if (name !== outfitOptionName) {
				await interaction.respond([]);
				return;
			}
			const results: Outfit[] = nearest<Outfit>(value.toLocaleLowerCase(resolvedLocale), outfits, 7, (outfit: Outfit): string => {
				const {name}: Outfit = outfit;
				const outfitName: string = name[resolvedLocale];
				return outfitName.toLocaleLowerCase(resolvedLocale);
			});
			const suggestions: ApplicationCommandOptionChoiceData[] = results.map<ApplicationCommandOptionChoiceData<number>>((outfit: Outfit): ApplicationCommandOptionChoiceData<number> => {
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
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {locale, options}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
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
						return Array.from<undefined, Outfit[]>({length}, (): Outfit[] => {
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
			const schedule: Localized<(groups: {}) => string> = composeAll<BareScheduleGroups, {}>(bareScheduleLocalizations, localize<BareScheduleGroups>((locale: Locale): BareScheduleGroups => {
				return {
					dayDateTime: (): string => {
						const dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
							dateStyle: "long",
							timeStyle: "short",
							timeZone: "UTC",
						});
						return escapeMarkdown(dateTimeFormat.format(dayDateTime));
					},
					outfitNameConjunction: (): string => {
						const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(locale, {
							style: "long",
							type: "conjunction",
						});
						return conjunctionFormat.format(scheduleOutfits.map<string>((outfit: Outfit): string => {
							return `**${escapeMarkdown(outfit.name[locale])}**`;
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
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: bareReplyLocalizations[resolvedLocale]({
				scheduleList: (): string => {
					return list(schedules.map<string>((schedule: Localized<(groups: {}) => string>): string => {
						return schedule[resolvedLocale]({});
					}));
				},
			}),
			ephemeral: true,
		});
		return;
		}
		const outfit: Outfit = outfits[id];
		if (rarities[outfit.rarity].slots === 0) {
			await interaction.reply({
				content: noSlotReplyLocalizations["en-US"]({
					outfitName: (): string => {
						return escapeMarkdown(outfit.name["en-US"]);
					},
				}),
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await interaction.followUp({
				content: noSlotReplyLocalizations[resolvedLocale]({
					outfitName: (): string => {
						return escapeMarkdown(outfit.name[resolvedLocale]);
					},
				}),
				ephemeral: true,
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
				const schedule: Localized<(groups: {}) => string> = composeAll<ScheduleGroups, {}>(scheduleLocalizations, localize<ScheduleGroups>((locale: Locale): ScheduleGroups => {
					return {
						dayDateTime: (): string => {
							const dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
								dateStyle: "long",
								timeStyle: "short",
								timeZone: "UTC",
							});
							return escapeMarkdown(dateTimeFormat.format(dayDateTime));
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
					return escapeMarkdown(`${tokens}`);
				},
			};
		})) : null;
		const coins: number = rarities[outfit.rarity].cost;
		const coinsCost: Localized<(groups: {}) => string> | null = coins !== 0 ? composeAll<CoinsCostGroups, {}>(coinsCostLocalizations, localize<CoinsCostGroups>((): CoinsCostGroups => {
			return {
				coins: (): string => {
					return escapeMarkdown(`${coins}`);
				},
			};
		})) : null;
		const costs: Localized<(groups: {}) => string>[] = [tokensCost, coinsCost].filter<Localized<(groups: {}) => string>>((cost: Localized<(groups: {}) => string> | null): cost is Localized<(groups: {}) => string> => {
			return cost != null;
		});
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				outfitName: (): string => {
					return escapeMarkdown(outfit.name["en-US"]);
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
					return escapeMarkdown(noCostLocalizations["en-US"]({}));
				},
				scheduleList: (): string => {
					return list(schedules.map<string>((schedule: Localized<(groups: {}) => string>): string => {
						return schedule["en-US"]({})
					}));
				},
			}),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: replyLocalizations[resolvedLocale]({
				outfitName: (): string => {
					return escapeMarkdown(outfit.name[resolvedLocale]);
				},
				costConjunction: (): string => {
					if (costs.length !== 0) {
						const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(resolvedLocale, {
							style: "long",
							type: "conjunction",
						});
						return conjunctionFormat.format(costs.map<string>((cost: Localized<(groups: {}) => string>): string => {
							return cost[resolvedLocale]({});
						}));
					}
					return escapeMarkdown(noCostLocalizations[resolvedLocale]({}));
				},
				scheduleList: (): string => {
					return list(schedules.map<string>((schedule: Localized<(groups: {}) => string>): string => {
						return schedule[resolvedLocale]({})
					}));
				},
			}),
			ephemeral: true,
		});
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
				outfitOptionDescription: (): string => {
					return outfitOptionDescription[locale];
				},
			};
		}));
	},
};
export default outfitCommand;
