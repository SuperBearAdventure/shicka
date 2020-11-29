import discord from "discord.js";
import Command from "../command.js";
import {xorShift32} from "../random.js";
const {Util} = discord;
const channels = new Set(["bot", "moderation"]);
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "UTC",
});
const listFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
const rarities = ["common", "rare", "epic", "tristopio"];
const itemsPerSlicePerRarity = Object.assign(Object.create(null), {
	common: 4,
	rare: 2,
	epic: 1,
	tristopio: 1,
});
const costsPerRarity = Object.assign(Object.create(null), {
	common: 100,
	rare: 300,
	epic: 1500,
});
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
		if (!channels.has(message.channel.name)) {
			return;
		}
		const {salt, itemsByRarity} = message.client;
		const slicesByRarityBySeed = Object.create(null);
		const slicesPerRarity = Math.ceil(Math.max(...rarities.map((rarity) => {
			return itemsByRarity[rarity].length / itemsPerSlicePerRarity[rarity];
		})));
		const now = Math.floor(Date.now() / 21600000);
		const search = parameters.slice(1).join(" ").toLowerCase();
		if (search === "") {
		const sample = [];
		for (let k = -2; k < 4; ++k) {
			const date = now + k;
			const seed = Math.floor(date / slicesPerRarity);
			if (!(seed in slicesByRarityBySeed)) {
				const generator = xorShift32(BigInt(seed) + BigInt(salt));
				const slicesByRarity = Object.create(null);
				for (const rarity of rarities) {
					slicesByRarity[rarity] = sliceItems(generator, itemsByRarity[rarity], itemsPerSlicePerRarity[rarity], slicesPerRarity);
				};
				slicesByRarityBySeed[seed] = slicesByRarity;
			}
			const slicesByRarity = slicesByRarityBySeed[seed];
			const index = date - seed * slicesPerRarity;
			const items = [];
			for (const rarity of rarities) {
				items.push(...slicesByRarity[rarity][index]);
			}
			const names = items.map((item) => {
				return `**${Util.escapeMarkdown(item.name)}**`;
			});
			const dateTime = dateTimeFormat.format(new Date(date * 21600000));
			const list = listFormat.format(names);
			sample.push(`- *${Util.escapeMarkdown(dateTime)}* (local time): ${list}`);
		}
		const schedule = sample.join("\n");
		await message.channel.send(schedule);
		return;
		}
		const target = message.client.items.find((item) => {
			return item.rarity in itemsPerSlicePerRarity && item.name.toLowerCase() === search;
		});
		if (typeof target === "undefined") {
			await message.channel.send(`I do not know any outfit with this name.`);
			return;
		}
		const {rarity} = target;
		const sample = [];
		outer: for (let k = -2;; ++k) {
			const date = now + k;
			const seed = Math.floor(date / slicesPerRarity);
			if (!(seed in slicesByRarityBySeed)) {
				const generator = xorShift32(BigInt(seed) + BigInt(salt));
				const slicesByRarity = Object.create(null);
				for (const rarity of rarities) {
					slicesByRarity[rarity] = sliceItems(generator, itemsByRarity[rarity], itemsPerSlicePerRarity[rarity], slicesPerRarity);
				};
				slicesByRarityBySeed[seed] = slicesByRarity;
			}
			const slicesByRarity = slicesByRarityBySeed[seed];
			const index = date - seed * slicesPerRarity;
			inner: for (const item of slicesByRarity[rarity][index]) {
				if (item !== target) {
					continue;
				}
				const dateTime = dateTimeFormat.format(new Date(date * 21600000));
				sample.push(`- *${Util.escapeMarkdown(dateTime)}* (local time)`);
				if (k < 4 || sample.length < 2) {
					break inner;
				}
				break outer;
			}
		}
		const name = `**${Util.escapeMarkdown(target.name)}**`;
		const cost = `**${Util.escapeMarkdown(target.rarity === "tristopio" ? `${target.cost} Tristopio tokens` : `${costsPerRarity[target.rarity]} coins`)}**`;
		const schedule = sample.join("\n");
		await message.channel.send(`${name} will be for sale in the shop for ${cost} for 6 hours starting:\n${schedule}`);
	}
	async describe(message, command) {
		if (!channels.has(message.channel.name)) {
			return "";
		}
		return `Type \`${command}\` to know what is for sale in the shop\nType \`${command} Item\` to know when the outfit \`Item\` is for sale in the shop`;
	}
}
