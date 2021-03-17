import discord from "discord.js";
import Command from "../command.js";
const {Util} = discord;
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "UTC",
});
const listFormat = new Intl.ListFormat("en-US", {
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
function shuffle(generator, items) {
	for (let i = items.length - 1; i > 0; --i) {
		const j = Number(generator.next().value * BigInt(i + 1) >> 32n);
		[items[i], items[j]] = [items[j], items[i]];
	}
}
function sliceItems(generator, items, itemsPerSlice, slicesPerRarity) {
	items = items.slice();
	const slices = [];
	const stash = new Set();
	const itemsPerShuffle = items.length;
	const slicesPerShuffle = Math.floor(itemsPerShuffle / itemsPerSlice);
	const remainingItemsCount = itemsPerShuffle % itemsPerSlice;
	for (let i = 0; i < slicesPerRarity; i += slicesPerShuffle) {
		shuffle(generator, items);
		const overflow = [];
		const remainingSlicesCount = Math.min(slicesPerRarity - i, slicesPerShuffle);
		let j = 0;
		for (let k = 0; k < remainingSlicesCount - 1; ++k) {
			while (overflow.length < remainingItemsCount && !stash.has(items[j])) {
				overflow.push(items[j++]);
			}
			const slice = [];
			for (let l = 0; l < itemsPerSlice; ++l) {
				const item = items[j++];
				slice.push(item)
				stash.delete(item);
			}
			slices.push(slice);
		}
		const slice = [...stash.keys()];
		while (slice.length < itemsPerSlice) {
			const item = items[j++];
			if (!stash.has(item)) {
				slice.push(item);
			}
		}
		stash.clear();
		slices.push(slice);
		for (const item of overflow) {
			stash.add(item);
		}
	}
	shuffle(generator, slices);
	return slices;
}
export default class ShopCommand extends Command {
	async execute(message, parameters) {
		const {salt, data, indices} = message.client;
		const {items, rarities} = data;
		const {itemsByRarity} = indices;
		const slicesByRarityBySeed = Object.create(null);
		const slicesPerRarity = Math.ceil(Math.max(...rarities.map((rarity) => {
			if (!rarity.slots) {
				return 0;
			}
			return itemsByRarity[rarity.id].length / rarity.slots;
		})));
		const now = Math.floor(Date.now() / 21600000);
		const search = parameters.slice(1).join(" ").toLowerCase();
		if (search === "") {
		const sample = [];
		for (let k = -2; k < 4; ++k) {
			const date = now + k;
			const seed = Math.floor(date / slicesPerRarity);
			const slicesByRarity = slicesByRarityBySeed[seed] ??= (() => {
				const generator = xorShift32(knuth(BigInt(seed) + BigInt(salt)) || BigInt(salt));
				return rarities.map((rarity) => {
					if (!rarity.slots) {
						const length = slicesPerRarity;
						return Array.from({length}, () => {
							return [];
						});
					}
					return sliceItems(generator, itemsByRarity[rarity.id], rarity.slots, slicesPerRarity);
				});
			})();
			const index = date - seed * slicesPerRarity;
			const names = slicesByRarity.map((slices) => {
				return slices[index];
			}).flat().map((item) => {
				return `**${Util.escapeMarkdown(item.name)}**`;
			});
			const dateTime = dateTimeFormat.format(new Date(date * 21600000));
			const list = listFormat.format(names);
			sample.push(`- *${Util.escapeMarkdown(dateTime)}*: ${list}`);
		}
		const schedule = sample.join("\n");
		await message.channel.send(`Outfits for sale in the shop change every 6 hours:\n${schedule}`);
		return;
		}
		const item = items.find((item) => {
			return item.name.toLowerCase() === search;
		});
		if (typeof item === "undefined") {
			await message.channel.send(`I do not know any outfit with this name.`);
			return;
		}
		if (!rarities[item.rarity].slots) {
			const name = `**${Util.escapeMarkdown(item.name)}**`;
			await message.channel.send(`${name} is not for sale.`);
			return;
		}
		const sample = [];
		for (let k = -2; k < 4 || sample.length < 2; ++k) {
			const date = now + k;
			const seed = Math.floor(date / slicesPerRarity);
			const slicesByRarity = slicesByRarityBySeed[seed] ??= (() => {
				const generator = xorShift32(knuth(BigInt(seed) + BigInt(salt)) || BigInt(salt));
				return rarities.map((rarity) => {
					if (!rarity.slots) {
						return [];
					}
					return sliceItems(generator, itemsByRarity[rarity.id], rarity.slots, slicesPerRarity);
				});
			})();
			const index = date - seed * slicesPerRarity;
			if (slicesByRarity[item.rarity][index].includes(item)) {
				const dateTime = dateTimeFormat.format(new Date(date * 21600000));
				sample.push(`- *${Util.escapeMarkdown(dateTime)}*`);
			}
		}
		const name = `**${Util.escapeMarkdown(item.name)}**`;
		const costs = [];
		const tokens = item.cost;
		if (tokens) {
			costs.push(`**${tokens} Tristopio token${tokens !== 1 ? "s" : ""}**`)
		}
		const coins = rarities[item.rarity].cost;
		if (coins) {
			costs.push(`**${coins} coin${coins !== 1 ? "s" : ""}**`)
		}
		const list = `${costs.length ? " for " : ""}${listFormat.format(costs)}`;
		const schedule = sample.join("\n");
		await message.channel.send(`${name} will be for sale in the shop${list} for 6 hours starting:\n${schedule}`);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know what is for sale in the shop\nType \`${command} Some item\` to know when \`Some item\` is for sale in the shop`;
	}
}
