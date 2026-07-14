import type {
	ApplicationCommandOptionChoiceData,
	AttachmentPayload,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
} from "discord.js";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";
import type {Outfit, Rarity} from "../bindings.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Outfit as OutfitCompilation} from "../compilations.js";
import type {Outfit as OutfitDefinition} from "../definitions.js";
import type {Outfit as OutfitDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {fileURLToPath} from "node:url";
import {
	ApplicationCommandOptionType,
	escapeMarkdown,
} from "discord.js";
import canvas from "canvas";
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
type Schedule = {
	content: Localized<(groups: {}) => string>,
	attachment: Buffer<ArrayBufferLike>,
	name: string,
};
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
const {createCanvas, deregisterAllFonts, loadImage, registerFont}: any = canvas;
const {
	SHICKA_OUTFIT_GENERATOR_SALT,
}: NodeJS.ProcessEnv = process.env;
const commandGeneratorSalt: string = SHICKA_OUTFIT_GENERATOR_SALT ?? "";
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
					maxValue: Object.keys(outfits).length - 1,
					autocomplete: true,
				},
			],
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (interaction.isAutocomplete()) {
			const {locale, options}: AutocompleteInteraction<"cached"> = interaction;
			const resolvedLocale: Locale = resolve(locale);
			const {name, value}: AutocompleteFocusedOption = options.getFocused(true);
			if (name !== outfitOptionName) {
				await interaction.respond([]);
				return;
			}
			const results: Outfit[] = nearest<Outfit>(value.toLocaleLowerCase(resolvedLocale), Object.values(outfits), 7, (outfit: Outfit): string => {
				const {name}: Outfit = outfit;
				const outfitName: string = name[resolvedLocale];
				return outfitName.toLocaleLowerCase(resolvedLocale);
			});
			const suggestions: ApplicationCommandOptionChoiceData[] = results.map<ApplicationCommandOptionChoiceData<number>>((outfit: Outfit): ApplicationCommandOptionChoiceData<number> => {
				const {index, name}: Outfit = outfit;
				const outfitName: string = name[resolvedLocale];
				return {
					name: outfitName,
					value: index,
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
		const slicesPerRarity: number = Math.ceil(Math.max(...Object.values(rarities).map<number>((rarity: Rarity): number => {
			if (rarity.slots === 0) {
				return 0;
			}
			return Object.keys(outfitsByRarity[rarity.key] ?? Object.create(null)).length / rarity.slots;
		})));
		const now: number = Math.floor(interaction.createdTimestamp / 28800000);
		const index: number | null = options.getInteger(outfitOptionName);
		if (index == null) {
		const schedules: Schedule[] = [];
		for (let k: number = -2; k < 3; ++k) {
			const day: number = now + k;
			const seed: number = Math.floor(day / slicesPerRarity);
			const slicesByRarity: Outfit[][][] = slicesByRarityBySeed[seed] ??= ((): Outfit[][][] => {
				const generator: Iterator<bigint> = xorShift32(knuth(BigInt(seed) + BigInt(commandGeneratorSalt)) || BigInt(commandGeneratorSalt));
				return Object.values(rarities).map<Outfit[][]>((rarity: Rarity): Outfit[][] => {
					if (rarity.slots === 0) {
						const length: number = slicesPerRarity;
						return Array.from<undefined, Outfit[]>({length}, (): Outfit[] => {
							return [];
						});
					}
					return sliceOutfits(generator, Object.values(outfitsByRarity[rarity.key] ?? Object.create(null)), rarity.slots, slicesPerRarity);
				});
			})();
			const index: number = day - seed * slicesPerRarity;
			const scheduleOutfits: Outfit[] = slicesByRarity.map<Outfit[]>((slices: Outfit[][]): Outfit[] => {
				return slices[index];
			}).flat<Outfit[][]>();
			const width: number = rarities["rarity_common"].slots;
			const height: number = Math.ceil(scheduleOutfits.length / width);
			registerFont(fileURLToPath(import.meta.resolve(`../fonts/milky-nice-clean.ttf`)), {
				family: "MilkyNice",
			});
			const canvas: Canvas = createCanvas((96 + 8) * width, (96 + 8 + 24) * height);
			const context: CanvasRenderingContext2D = canvas.getContext("2d");
			for (const [slot, outfit] of scheduleOutfits.entries()) {
				context.fillStyle = rarities[outfit.rarity].color;
				context.beginPath();
				context.roundRect((96 + 8) * (slot % width) + 8 / 2, (96 + 8 + 24) * Math.floor(slot / width) + 8 / 2, 96, 96 + 24, 12);
				context.fill();
				const image: Image = await loadImage(fileURLToPath(import.meta.resolve(`../outfits/${outfit.key}.png`)));
				context.drawImage(image, (96 + 8) * (slot % width) + 8 / 2, (96 + 8 + 24) * Math.floor(slot / width) + 8 / 2, 96, 96);
				context.fillStyle = "#3333";
				context.beginPath();
				context.roundRect((96 + 8) * (slot % width) + 8 / 2, (96 + 8 + 24) * Math.floor(slot / width) + 96 + 8 / 2, 96, 24, [0, 0, 12, 12]);
				context.fill();
				context.lineWidth = 2;
				context.lineCap = "round";
				context.lineJoin = "round";
				context.textAlign = "center";
				context.textBaseline = "middle";
				context.font = `bold ${24}px / 1.25 "MilkyNice"`;
				context.strokeStyle = "#000";
				context.strokeText(outfit.name["en-US"], (96 + 8) * (slot % width) + 96 / 2 + 8 / 2, (96 + 8 + 24) * Math.floor(slot / width) + 96 + 8 / 2 + 24 / 2, 96);
				context.strokeText(outfit.name["en-US"], (96 + 8) * (slot % width) + 96 / 2 + 8 / 2, (96 + 8 + 24) * Math.floor(slot / width) + 96 + 8 / 2 + 24 / 2 + 2 / 2, 96);
				context.fillStyle = "#fff";
				context.fillText(outfit.name["en-US"], (96 + 8) * (slot % width) + 96 / 2 + 8 / 2, (96 + 8 + 24) * Math.floor(slot / width) + 96 + 8 / 2 + 24 / 2, 96);
			}
			deregisterAllFonts();
			const dayDateTime: Date = new Date(day * 28800000);
			const schedule: Localized<(groups: {}) => string> = composeAll<BareScheduleGroups, {}>(bareScheduleLocalizations, localize<BareScheduleGroups>((locale: Locale): BareScheduleGroups => {
				const dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
					dateStyle: "long",
					timeStyle: "short",
					timeZone: "UTC",
				});
				const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(locale, {
					style: "long",
					type: "conjunction",
				});
				return {
					dayDateTime: (): string => {
						return escapeMarkdown(dateTimeFormat.format(dayDateTime));
					},
					outfitNameConjunction: (): string => {
						return conjunctionFormat.format(scheduleOutfits.map<string>((outfit: Outfit): string => {
							return `**${escapeMarkdown(outfit.name[locale])}**`;
						}));
					},
				};
			}));
			schedules.push({
				content: schedule,
				attachment: canvas.toBuffer(),
				name: `${day}.png`,
			});
		}
		function formatMessage(locale: Locale): string {
			return bareReplyLocalizations[locale]({
				scheduleList: (): string => {
					return list(schedules.map<string>((schedule: Schedule): string => {
						return schedule.content[locale]({});
					}));
				},
			});
		}
		await interaction.reply({
			content: formatMessage("en-US"),
			files: schedules.map<AttachmentPayload>((schedule: Schedule): AttachmentPayload => {
				return {
					attachment: schedule.attachment,
					name: schedule.name,
				};
			})
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: formatMessage(resolvedLocale),
			ephemeral: true,
		});
		return;
		}
		const outfit: Outfit = Object.values(outfits)[index];
		const canvas: Canvas = createCanvas(256 + 32, 256 + 32 + 64);
		const context: CanvasRenderingContext2D = canvas.getContext("2d");
		context.fillStyle = rarities[outfit.rarity].color;
		context.beginPath();
		context.roundRect(32 / 2, 32 / 2, 256, 256 + 64, 32);
		context.fill();
		const image: Image = await loadImage(fileURLToPath(import.meta.resolve(`../outfits/${outfit.key}.png`)));
		context.drawImage(image, 32 / 2, 32 / 2, 256, 256);
		context.fillStyle = "#3333";
		context.beginPath();
		context.roundRect(32 / 2, 256 + 32 / 2, 256, 64, [0, 0, 32, 32]);
		context.fill();
		context.lineWidth = 6;
		context.lineCap = "round";
		context.lineJoin = "round";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = `bold ${64}px / 1.25 "MilkyNice"`;
		context.strokeStyle = "#000";
		context.strokeText(outfit.name["en-US"], 256 / 2 + 32 / 2, 256 + 32 / 2 + 64 / 2, 256);
		context.strokeText(outfit.name["en-US"], 256 / 2 + 32 / 2, 256 + 32 / 2 + 64 / 2 + 6 / 2, 256);
		context.fillStyle = "#fff";
		context.fillText(outfit.name["en-US"], 256 / 2 + 32 / 2, 256 + 32 / 2 + 64 / 2, 256);
		if (rarities[outfit.rarity].slots === 0) {
			function formatMessage(locale: Locale): string {
				return noSlotReplyLocalizations[locale]({
					outfitName: (): string => {
						return escapeMarkdown(outfit.name[locale]);
					},
				});
			}
			await interaction.reply({
				content: formatMessage("en-US"),
				files: [
					{
						attachment: canvas.toBuffer(),
						name: `${outfit.key}.png`,
					},
				],
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await interaction.followUp({
				content: formatMessage(resolvedLocale),
				ephemeral: true,
			});
			return;
		}
		const schedules: Localized<(groups: {}) => string>[] = [];
		for (let k: number = -2; k < 3 || schedules.length < 2; ++k) {
			const day: number = now + k;
			const seed: number = Math.floor(day / slicesPerRarity);
			const slicesByRarity: Outfit[][][] = slicesByRarityBySeed[seed] ??= ((): Outfit[][][] => {
				const generator: Iterator<bigint> = xorShift32(knuth(BigInt(seed) + BigInt(commandGeneratorSalt)) || BigInt(commandGeneratorSalt));
				return Object.values(rarities).map<Outfit[][]>((rarity: Rarity): Outfit[][] => {
					if (rarity.slots === 0) {
						return [];
					}
					return sliceOutfits(generator, Object.values(outfitsByRarity[rarity.key] ?? Object.create(null)), rarity.slots, slicesPerRarity);
				});
			})();
			const index: number = day - seed * slicesPerRarity;
			if (slicesByRarity[rarities[outfit.rarity].index][index].includes(outfit)) {
				const dayDateTime: Date = new Date(day * 28800000);
				const schedule: Localized<(groups: {}) => string> = composeAll<ScheduleGroups, {}>(scheduleLocalizations, localize<ScheduleGroups>((locale: Locale): ScheduleGroups => {
					const dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
						dateStyle: "long",
						timeStyle: "short",
						timeZone: "UTC",
					});
					return {
						dayDateTime: (): string => {
							return escapeMarkdown(dateTimeFormat.format(dayDateTime));
						},
					};
				}));
				schedules.push(schedule);
			}
		}
		const tokens: number = outfit.cost;
		const tokensCost: Localized<(groups: {}) => string> | null = tokens !== 0 ? composeAll<TokensCostGroups, {}>(tokensCostLocalizations, localize<TokensCostGroups>((locale: Locale): TokensCostGroups => {
			const cardinalFormat: Intl.NumberFormat = new Intl.NumberFormat(locale);
			return {
				tokens: (): string => {
					return escapeMarkdown(cardinalFormat.format(tokens));
				},
			};
		})) : null;
		const coins: number = rarities[outfit.rarity].cost;
		const coinsCost: Localized<(groups: {}) => string> | null = coins !== 0 ? composeAll<CoinsCostGroups, {}>(coinsCostLocalizations, localize<CoinsCostGroups>((locale: Locale): CoinsCostGroups => {
			const cardinalFormat: Intl.NumberFormat = new Intl.NumberFormat(locale);
			return {
				coins: (): string => {
					return escapeMarkdown(cardinalFormat.format(coins));
				},
			};
		})) : null;
		const costs: Localized<(groups: {}) => string>[] = [tokensCost, coinsCost].filter<Localized<(groups: {}) => string>>((cost: Localized<(groups: {}) => string> | null): cost is Localized<(groups: {}) => string> => {
			return cost != null;
		});
		function formatMessage(locale: Locale): string {
			const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(locale, {
				style: "long",
				type: "conjunction",
			});
			return replyLocalizations[locale]({
				outfitName: (): string => {
					return escapeMarkdown(outfit.name[locale]);
				},
				costConjunction: (): string => {
					return costs.length !== 0 ? conjunctionFormat.format(costs.map<string>((cost: Localized<(groups: {}) => string>): string => {
						return cost[locale]({});
					})) : escapeMarkdown(noCostLocalizations[locale]({}));
				},
				scheduleList: (): string => {
					return list(schedules.map<string>((schedule: Localized<(groups: {}) => string>): string => {
						return schedule[locale]({})
					}));
				},
			});
		}
		await interaction.reply({
			content: formatMessage("en-US"),
			files: [
				{
					attachment: canvas.toBuffer(),
					name: `${outfit.key}.png`,
				},
			],
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: formatMessage(resolvedLocale),
			ephemeral: true,
		});
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				commandMention: (): string => {
					return `</${commandName}:${applicationCommand.id}>`;
				},
				outfitOptionDescription: (): string => {
					return outfitOptionDescription[locale];
				},
			};
		}));
	},
};
export default outfitCommand;
