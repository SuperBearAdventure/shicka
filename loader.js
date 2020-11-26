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
	return JSON.parse(await readFile(fileURLToPath(`${root}/greetings.json`)), (key, value) => {
		return reviver(value);
	});
}
export async function loadItems() {
	const items = JSON.parse(await readFile(fileURLToPath(`${root}/items.json`)), (key, value) => {
		return reviver(value);
	});
	const itemsByRarity = Object.create(null);
	const itemsByRarityByType = Object.create(null);
	for (const item of items) {
		const {rarity, type} = item;
		if (!(rarity in itemsByRarity)) {
			itemsByRarity[rarity] = [];
		}
		itemsByRarity[rarity].push(item);
		// if (!(type in itemsByRarityByType)) {
		// 	itemsByRarityByType[type] = Object.create(null);
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
	return {items, itemsByRarity, itemsByRarityByType};
}
