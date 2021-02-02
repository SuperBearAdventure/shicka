import url from "url";
import fs from "fs";
import discord from "discord.js";
const {fileURLToPath} = url;
const {readFile, readdir} = fs.promises;
const {Collection} = discord;
const here = import.meta.url;
const root = here.slice(0, here.lastIndexOf("/"));
function reviver(value) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		return value;
	}
	return Object.assign(Object.create(null), value);
}
export async function loadActions(directories) {
	const directoryPromises = directories.map(async (directory) => {
		const files = await readdir(fileURLToPath(`${root}/${directory}`));
		const filePromises = files.filter((file) => {
			return file.endsWith(".js");
		}).map(async (file) => {
			const name = file.slice(0, -3);
			const constructor = (await import(`${root}/${directory}/${file}`)).default;
			const action = new constructor();
			return [name, action];
		});
		return new Collection(await Promise.all(filePromises));
	});
	return await Promise.all(directoryPromises);
}
export async function loadGreetings() {
	return JSON.parse(await readFile(fileURLToPath(`${root}/data/greetings.json`)), (key, value) => {
		return reviver(value);
	});
}
export async function loadItems() {
	const items = JSON.parse(await readFile(fileURLToPath(`${root}/data/items.json`)), (key, value) => {
		return reviver(value);
	});
	for (const [id, item] of items.entries()) {
		item.id = id;
	}
	return items;
}
export async function loadUpdates() {
	const updates = JSON.parse(await readFile(fileURLToPath(`${root}/data/updates.json`)), (key, value) => {
		return reviver(value);
	});
	for (const [id, update] of updates.entries()) {
		update.id = id;
	}
	return updates;
}
export async function loadRarities() {
	const rarities = JSON.parse(await readFile(fileURLToPath(`${root}/data/rarities.json`)), (key, value) => {
		return reviver(value);
	});
	for (const [id, rarity] of rarities.entries()) {
		rarity.id = id;
	}
	return rarities;
}
export async function indexItemsByRarity(items, rarities) {
	const itemsByRarity = Array.from(rarities, () => {
		return [];
	});
	for (const item of items) {
		const {id, rarity} = item;
		itemsByRarity[rarity].push(id);
	}
	return itemsByRarity;
}
export async function indexItemsByRarityByType(items, rarities) {
	const itemsByRarityByType = Object.create(null);
	for (const item of items) {
		const {id, rarity, type} = item;
		const itemsByRarity = itemsByRarityByType[type] ?? (itemsByRarityByType[type] = Array.from(rarities, () => {
			return [];
		}));
		itemsByRarityByType[type][rarity].push(id);
	}
	for (const type in itemsByRarityByType) {
		for (const itemsByRarity of itemsByRarityByType[type]) {
			itemsByRarity.sort((a, b) => {
				const aName = items[a].name.toLowerCase();
				const bName = items[b].name.toLowerCase();
				if (aName > bName) {
					return 1;
				}
				if (aName < bName) {
					return -1;
				}
				return 0;
			});
		}
	}
	return itemsByRarityByType;
}
