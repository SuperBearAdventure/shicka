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
