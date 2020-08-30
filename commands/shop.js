import url from "url";
import fs from "fs";
import discord from "discord.js";
import Command from "../command.js";
import {xorShift32} from "../random.js";
const {fileURLToPath} = url;
const {readFile} = fs.promises;
const {Util} = discord;
const here = import.meta.url;
const root = here.slice(0, here.lastIndexOf("/"));
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "UTC",
});
const listFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
function choice(generator, items) {
	return items[Number(generator.next().value * BigInt(items.length) >> 32n)];
}
export default class ShopCommand extends Command {
	constructor() {
		super();
		this._initialized = false;
		// this._items = null;
		this._itemsByRarity = null;
		// this._itemsByRarityByType = null;
	}
	async _initialize() {
		if (this._initialized) {
			return;
		}
		const items = JSON.parse(await readFile(fileURLToPath(`${root}/../items.json`)));
		const itemsByRarity = Object.create(null);
		// const itemsByRarityByType = Object.create(null);
		for (const item of items) {
			const {rarity, type} = item;
			if (!(rarity in itemsByRarity)) {
				itemsByRarity[rarity] = [];
			}
			itemsByRarity[rarity].push(item);
			// if (!(type in itemsByRarityByType)) {
			// 	itemsByRarityByType[type] = {};
			// }
			// if (!(rarity in itemsByRarityByType[type])) {
			// 	itemsByRarityByType[type][rarity] = [];
			// }
			// itemsByRarityByType[type][rarity].push(item);
		}
		// for (const type in itemsByRarityByType) {
		// 	for (const rarity in itemsByRarityByType[type]) {
		// 		itemsByRarityByType[type][rarity].sort((a, b) => {
		// 			const aName = a.name.toLowerCase();
		// 			const bName = b.name.toLowerCase();
		// 			if (aName > bName) {
		// 				return 1;
		// 			}
		// 			if (aName < bName) {
		// 				return -1;
		// 			}
		// 			return 0;
		// 		});
		// 	}
		// }
		this._initialized = true;
		// this._items = items;
		this._itemsByRarity = itemsByRarity;
		// this._itemsByRarityByType = itemsByRarityByType;
	}
	async execute(message, parameters) {
		await this._initialize();
		const itemsByRarity = this._itemsByRarity;
		const now = Math.floor(Date.now() / 21600000);
		const sample = [];
		for (let k = -2; k < 4; ++k) {
			const date = now + k;
			const generator = xorShift32(BigInt(date));
			const items = Array.from({length: 8});
			items[0] = choice(generator, itemsByRarity.common);
			do {
				items[1] = choice(generator, itemsByRarity.common);
			} while (items[0] === items[1]);
			do {
				items[2] = choice(generator, itemsByRarity.common);
			} while (items[0] === items[2] || items[1] === items[2]);
			do {
				items[3] = choice(generator, itemsByRarity.common);
			} while (items[0] === items[3] || items[1] === items[3] || items[2] === items[3]);
			items[4] = choice(generator, itemsByRarity.rare);
			do {
				items[5] = choice(generator, itemsByRarity.rare);
			} while (items[4] === items[5]);
			items[6] = choice(generator, itemsByRarity.epic);
			items[7] = choice(generator, itemsByRarity.tristopio);
			const names = items.map((item) => {
				return `**${Util.escapeMarkdown(item.name)}**`;
			});
			const dateTime = dateTimeFormat.format(new Date(date * 21600000));
			const list = listFormat.format(names);
			sample.push(`*${Util.escapeMarkdown(dateTime)}* (local time): ${list}`);
		}
		const schedule = sample.join("\n");
		await message.channel.send(schedule);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know what is for sale in the shop`;
	}
}
