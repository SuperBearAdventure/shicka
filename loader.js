import url from "url";
import fs from "fs";
const {fileURLToPath} = url;
const {readFile, readdir} = fs.promises;
async function load(directory, extension, callback) {
	const {length} = extension;
	const files = await readdir(fileURLToPath(directory));
	const entries = await Promise.all(files.filter((file) => {
		return file.endsWith(extension);
	}).map(async (file) => {
		const key = file.slice(0, -length);
		const value = await callback(`${directory}/${file}`);
		return [key, value];
	}));
	return Object.assign(Object.create(null), Object.fromEntries(entries));
}
export async function loadActions(directory) {
	return await load(directory, ".js", async (path) => {
		const action = new (await import(path)).default();
		return action;
	});
}
export async function loadData(directory) {
	return await load(directory, ".json", async (path) => {
		const datum = JSON.parse(await readFile(fileURLToPath(path)));
		for (const [key, value] of datum.entries()) {
			value.id = key;
		}
		return datum;
	});
}
export async function loadGreetings(directory) {
	return await load(directory, ".json", async (path) => {
		const greeting = JSON.parse(await readFile(fileURLToPath(path)));
		return greeting;
	});
}
function indexBy(left, right, key) {
	const array = Array.from(right, () => {
		return [];
	});
	for (const item of left) {
		array[item[key]].push(item);
	}
	return array;
}
export function indexBearsByLevel(bears, levels) {
	return indexBy(bears, levels, "level");
}
export function indexItemsByPart(items, parts) {
	const itemsByPart = indexBy(items, parts, "part");
	for (const items of itemsByPart) {
		items.sort((a, b) => {
			const aRarity = a.rarity;
			const bRarity = b.rarity;
			if (aRarity > bRarity) {
				return 1;
			}
			if (aRarity < bRarity) {
				return -1;
			}
			const aName = a.name.toLowerCase();
			const bName = b.name.toLowerCase();
			if (aName > bName) {
				return 1;
			}
			if (aName < bName) {
				return -1;
			}
			return 0;
		});
	}
	return itemsByPart;
}
export function indexItemsByRarity(items, rarities) {
	return indexBy(items, rarities, "rarity");
}
export function indexItemsByUpdate(items, updates) {
	return indexBy(items, updates, "update");
}
export function indexMissionsByChallenge(missions, challenges) {
	return indexBy(missions, challenges, "challenge");
}
export function indexMissionsByLevel(missions, levels) {
	return indexBy(missions, levels, "level");
}
