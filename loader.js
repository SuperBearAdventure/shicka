import url from "url";
import fs from "fs";
const {fileURLToPath} = url;
const {readFile, readdir} = fs.promises;
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
		return Object.assign(Object.create(null), Object.fromEntries(await Promise.all(filePromises)));
	});
	return await Promise.all(directoryPromises);
}
export async function loadData(files) {
	const filePromises = files.map(async (file) => {
		const datum = JSON.parse(await readFile(fileURLToPath(`${root}/data/${file}`)), (key, value) => {
			return reviver(value);
		});
		for (const [key, value] of datum.entries()) {
			value.id = key;
		}
		return datum;
	});
	return await Promise.all(filePromises);
}
export async function loadGreetings() {
	return JSON.parse(await readFile(fileURLToPath(`${root}/data/greetings.json`)), (key, value) => {
		return reviver(value);
	});
}
export function indexBearsByLevel(bears, levels) {
	const bearsByLevel = Array.from(levels, () => {
		return [];
	});
	for (const bear of bears) {
		const {level} = bear;
		bearsByLevel[level].push(bear);
	}
	return bearsByLevel;
}
export function indexItemsByPart(items, parts) {
	const itemsByPart = Array.from(parts, () => {
		return [];
	});
	for (const item of items) {
		const {part} = item;
		itemsByPart[part].push(item);
	}
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
	const itemsByRarity = Array.from(rarities, () => {
		return [];
	});
	for (const item of items) {
		const {rarity} = item;
		itemsByRarity[rarity].push(item);
	}
	return itemsByRarity;
}
export function indexMissionsByChallenge(missions, challenges) {
	const missionsByChallenge = Array.from(challenges, () => {
		return [];
	});
	for (const mission of missions) {
		const {challenge} = mission;
		missionsByChallenge[challenge].push(mission);
	}
	return missionsByChallenge;
}
export function indexMissionsByLevel(missions, levels) {
	const missionsByLevel = Array.from(levels, () => {
		return [];
	});
	for (const mission of missions) {
		const {level} = mission;
		missionsByLevel[level].push(mission);
	}
	return missionsByLevel;
}
