import discord from "discord.js";
import Command from "../command.js";
import {nearest} from "../utils/string.js"
const {Util} = discord;
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "UTC",
});
const conjunctionFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
function knuth(state) {
	return BigInt.asUintN(32, state * 2654435761n);
}
function* xorShift32(seed) {
	let t = BigInt.asUintN(32, seed);
	for (;;) {
		t = BigInt.asUintN(32, t ^ BigInt.asUintN(32, t << 13n));
		t = BigInt.asUintN(32, t ^ BigInt.asUintN(32, t >> 17n));
		t = BigInt.asUintN(32, t ^ BigInt.asUintN(32, t << 5n));
		yield t;
	}
}
function shuffle(generator, outfits) {
	for (let i = outfits.length - 1; i > 0; --i) {
		const j = Number(generator.next().value * BigInt(i + 1) >> 32n);
		[outfits[i], outfits[j]] = [outfits[j], outfits[i]];
	}
}
function sliceOutfits(generator, outfits, outfitsPerSlice, slicesPerRarity) {
	outfits = outfits.slice();
	const slices = [];
	const stash = new Set();
	const outfitsPerShuffle = outfits.length;
	const slicesPerShuffle = Math.floor(outfitsPerShuffle / outfitsPerSlice);
	const remainingOutfitsCount = outfitsPerShuffle % outfitsPerSlice;
	for (let i = 0; i < slicesPerRarity; i += slicesPerShuffle) {
		shuffle(generator, outfits);
		const overflow = [];
		const remainingSlicesCount = Math.min(slicesPerRarity - i, slicesPerShuffle);
		let j = 0;
		for (let k = 0; k < remainingSlicesCount - 1; ++k) {
			while (overflow.length < remainingOutfitsCount && !stash.has(outfits[j])) {
				overflow.push(outfits[j++]);
			}
			const slice = [];
			for (let l = 0; l < outfitsPerSlice; ++l) {
				const outfit = outfits[j++];
				slice.push(outfit)
				stash.delete(outfit);
			}
			slices.push(slice);
		}
		const slice = [...stash.keys()];
		while (slice.length < outfitsPerSlice) {
			const outfit = outfits[j++];
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
	shuffle(generator, slices);
	return slices;
}
export default class OutfitCommand extends Command {
	register(client, name) {
		const description = "Tells you what is for sale in the shop or when it is for sale";
		const options = [
			{
				type: "STRING",
				name: "outfit",
				description: "Some outfit",
				autocomplete: true,
			},
		];
		return {name, description, options};
	}
	async execute(interaction) {
		if (interaction.isAutocomplete()) {
			const {client, options} = interaction;
			const {data} = client;
			const {outfits} = data;
			const {name, value} = options.getFocused(true);
			if (name !== "outfit") {
				await interaction.respond([]);
				return;
			}
			const results = nearest(value.toLowerCase(), outfits, 7, (outfit) => {
				const {name} = outfit;
				return name.toLowerCase();
			});
			const suggestions = results.map((outfit) => {
				const {name} = outfit;
				return {
					name: name,
					value: name,
				};
			});
			await interaction.respond(suggestions);
			return;
		}
		const {client, options} = interaction;
		const {data, indices, salt} = client;
		const {outfits, rarities} = data;
		const {outfitsByRarity} = indices;
		const slicesByRarityBySeed = Object.create(null);
		const slicesPerRarity = Math.ceil(Math.max(...rarities.map((rarity) => {
			if (rarity.slots === 0) {
				return 0;
			}
			return outfitsByRarity[rarity.id].length / rarity.slots;
		})));
		const now = Math.floor(interaction.createdTimestamp / 21600000);
		const search = options.getString("outfit");
		if (search == null) {
		const schedules = [];
		for (let k = -2; k < 4; ++k) {
			const day = now + k;
			const seed = Math.floor(day / slicesPerRarity);
			const slicesByRarity = slicesByRarityBySeed[seed] ??= (() => {
				const generator = xorShift32(knuth(BigInt(seed) + BigInt(salt)) || BigInt(salt));
				return rarities.map((rarity) => {
					if (rarity.slots === 0) {
						const length = slicesPerRarity;
						return Array.from({length}, () => {
							return [];
						});
					}
					return sliceOutfits(generator, outfitsByRarity[rarity.id], rarity.slots, slicesPerRarity);
				});
			})();
			const index = day - seed * slicesPerRarity;
			const names = slicesByRarity.map((slices) => {
				return slices[index];
			}).flat().map((outfit) => {
				const {name} = outfit;
				return `**${Util.escapeMarkdown(name)}**`;
			});
			const dayDateTime = dateTimeFormat.format(new Date(day * 21600000));
			const nameConjunction = conjunctionFormat.format(names);
			schedules.push(`\u{2022} *${Util.escapeMarkdown(dayDateTime)}*: ${nameConjunction}`);
		}
		const scheduleList = schedules.join("\n");
		await interaction.reply(`Outfits for sale in the shop change every 6 hours:\n${scheduleList}`);
		return;
		}
		const results = nearest(search.toLowerCase(), outfits, 1, (outfit) => {
			const {name} = outfit;
			return name.toLowerCase();
		});
		if (results.length === 0) {
			await interaction.reply({
				content: `I do not know any outfit with this name.`,
				ephemeral: true,
			});
			return;
		}
		const outfit = results[0];
		if (rarities[outfit.rarity].slots === 0) {
			const {name} = outfit;
			await interaction.reply(`**${Util.escapeMarkdown(name)}** is not for sale.`);
			return;
		}
		const schedules = [];
		for (let k = -2; k < 4 || schedules.length < 2; ++k) {
			const day = now + k;
			const seed = Math.floor(day / slicesPerRarity);
			const slicesByRarity = slicesByRarityBySeed[seed] ??= (() => {
				const generator = xorShift32(knuth(BigInt(seed) + BigInt(salt)) || BigInt(salt));
				return rarities.map((rarity) => {
					if (rarity.slots === 0) {
						return [];
					}
					return sliceOutfits(generator, outfitsByRarity[rarity.id], rarity.slots, slicesPerRarity);
				});
			})();
			const index = day - seed * slicesPerRarity;
			if (slicesByRarity[outfit.rarity][index].includes(outfit)) {
				const dayDateTime = dateTimeFormat.format(new Date(day * 21600000));
				schedules.push(`\u{2022} *${Util.escapeMarkdown(dayDateTime)}*`);
			}
		}
		const {name} = outfit;
		const costs = [];
		const tokens = outfit.cost;
		if (tokens !== 0) {
			costs.push(`**${Util.escapeMarkdown(`${tokens}`)} Tristopio token${tokens !== 1 ? "s" : ""}**`);
		}
		const coins = rarities[outfit.rarity].cost;
		if (coins !== 0) {
			costs.push(`**${Util.escapeMarkdown(`${coins}`)} coin${coins !== 1 ? "s" : ""}**`);
		}
		const costConjunction = `${costs.length !== 0 ? " for " : ""}${conjunctionFormat.format(costs)}`;
		const scheduleList = schedules.join("\n");
		await interaction.reply(`**${Util.escapeMarkdown(name)}** will be for sale in the shop${costConjunction} for 6 hours starting:\n${scheduleList}`);
	}
	describe(interaction, name) {
		return `Type \`/${name}\` to know what is for sale in the shop\nType \`/${name} Some outfit\` to know when \`Some outfit\` is for sale in the shop`;
	}
}
