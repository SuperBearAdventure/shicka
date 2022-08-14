import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type {Outfit, Rarity} from "../bindings.js";
import type Command from "../commands.js";
import {Util} from "discord.js";
import {outfits, rarities} from "../bindings.js";
import {outfitsByRarity} from "../indices.js";
import {nearest} from "../utils/string.js";
const {
	SHICKA_SALT: salt = "",
}: NodeJS.ProcessEnv = process.env;
const commandName: string = "outfit";
const commandDescription: string = "Tells you what is for sale in the shop or when it is for sale";
const outfitOptionName: string = "outfit";
const outfitOptionDescription: string = "Some outfit";
const dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "UTC",
});
const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandName}\` to know what is for sale in the shop\nType \`/${commandName} ${outfitOptionDescription}\` to know when \`${outfitOptionDescription}\` is for sale in the shop`;
		},
	});
}
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
	const stash: Set<Outfit> = new Set();
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
			options: [
				{
					type: "STRING",
					name: outfitOptionName,
					description: outfitOptionDescription,
					autocomplete: true,
				},
			],
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (interaction.isAutocomplete()) {
			const {options}: AutocompleteInteraction = interaction;
			const {name, value}: AutocompleteFocusedOption = options.getFocused(true);
			if (name !== outfitOptionName) {
				await interaction.respond([]);
				return;
			}
			const results: Outfit[] = nearest<Outfit>(value.toLowerCase(), outfits, 7, (outfit: Outfit): string => {
				const {name}: Outfit = outfit;
				return name["en-US"].toLowerCase();
			});
			const suggestions: ApplicationCommandOptionChoiceData[] = results.map((outfit: Outfit): ApplicationCommandOptionChoiceData => {
				const {name}: Outfit = outfit;
				return {
					name: name["en-US"],
					value: name["en-US"],
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
		const slicesPerRarity: number = Math.ceil(Math.max(...rarities.map((rarity: Rarity): number => {
			if (rarity.slots === 0) {
				return 0;
			}
			return outfitsByRarity[rarity.id].length / rarity.slots;
		})));
		const now: number = Math.floor(interaction.createdTimestamp / 21600000);
		const search: string | null = options.getString(outfitOptionName);
		if (search == null) {
		const schedules: string[] = [];
		for (let k: number = -2; k < 4; ++k) {
			const day: number = now + k;
			const seed: number = Math.floor(day / slicesPerRarity);
			const slicesByRarity: Outfit[][][] = slicesByRarityBySeed[seed] ??= ((): Outfit[][][] => {
				const generator: Iterator<bigint> = xorShift32(knuth(BigInt(seed) + BigInt(salt)) || BigInt(salt));
				return rarities.map((rarity: Rarity): Outfit[][] => {
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
			const names: string[] = slicesByRarity.map((slices: Outfit[][]): Outfit[] => {
				return slices[index];
			}).flat().map((outfit: Outfit): string => {
				const {name}: Outfit = outfit;
				return `**${Util.escapeMarkdown(name["en-US"])}**`;
			});
			const dayDateTime: string = dateTimeFormat.format(new Date(day * 21600000));
			const nameConjunction: string = conjunctionFormat.format(names);
			schedules.push(`\u{2022} *${Util.escapeMarkdown(dayDateTime)}*: ${nameConjunction}`);
		}
		const scheduleList: string = schedules.join("\n");
		await interaction.reply(`Outfits for sale in the shop change every 6 hours:\n${scheduleList}`);
		return;
		}
		const results: Outfit[] = nearest<Outfit>(search.toLowerCase(), outfits, 1, (outfit: Outfit): string => {
			const {name}: Outfit = outfit;
			return name["en-US"].toLowerCase();
		});
		if (results.length === 0) {
			await interaction.reply({
				content: `I do not know any outfit with this name.`,
				ephemeral: true,
			});
			return;
		}
		const outfit: Outfit = results[0];
		if (rarities[outfit.rarity].slots === 0) {
			const {name}: Outfit = outfit;
			await interaction.reply(`**${Util.escapeMarkdown(name["en-US"])}** is not for sale.`);
			return;
		}
		const schedules: string[] = [];
		for (let k: number = -2; k < 4 || schedules.length < 2; ++k) {
			const day: number = now + k;
			const seed: number = Math.floor(day / slicesPerRarity);
			const slicesByRarity: Outfit[][][] = slicesByRarityBySeed[seed] ??= ((): Outfit[][][] => {
				const generator: Iterator<bigint> = xorShift32(knuth(BigInt(seed) + BigInt(salt)) || BigInt(salt));
				return rarities.map((rarity: Rarity): Outfit[][] => {
					if (rarity.slots === 0) {
						return [];
					}
					return sliceOutfits(generator, outfitsByRarity[rarity.id], rarity.slots, slicesPerRarity);
				});
			})();
			const index: number = day - seed * slicesPerRarity;
			if (slicesByRarity[outfit.rarity][index].includes(outfit)) {
				const dayDateTime: string = dateTimeFormat.format(new Date(day * 21600000));
				schedules.push(`\u{2022} *${Util.escapeMarkdown(dayDateTime)}*`);
			}
		}
		const {name}: Outfit = outfit;
		const costs: string[] = [];
		const tokens: number = outfit.cost;
		if (tokens !== 0) {
			costs.push(`**${Util.escapeMarkdown(`${tokens}`)} Tristopio token${tokens !== 1 ? "s" : ""}**`);
		}
		const coins: number = rarities[outfit.rarity].cost;
		if (coins !== 0) {
			costs.push(`**${Util.escapeMarkdown(`${coins}`)} coin${coins !== 1 ? "s" : ""}**`);
		}
		const costConjunction: string = `${costs.length !== 0 ? " for " : ""}${conjunctionFormat.format(costs)}`;
		const scheduleList: string = schedules.join("\n");
		await interaction.reply(`**${Util.escapeMarkdown(name["en-US"])}** will be for sale in the shop${costConjunction} for 6 hours starting:\n${scheduleList}`);
	},
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		return computeHelpLocalizations();
	},
};
export default outfitCommand;
