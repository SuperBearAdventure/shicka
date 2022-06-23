function indexBy(left, right, key) {
	const array = Array.from(right, () => {
		return [];
	});
	for (const value of left) {
		array[value[key]].push(value);
	}
	return array;
}
export function indexBearsByLevel(bears, levels) {
	return indexBy(bears, levels, "level");
}
export function indexOutfitsByPart(outfits, parts) {
	const outfitsByPart = indexBy(outfits, parts, "part");
	for (const outfits of outfitsByPart) {
		outfits.sort((a, b) => {
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
	return outfitsByPart;
}
export function indexOutfitsByRarity(outfits, rarities) {
	return indexBy(outfits, rarities, "rarity");
}
export function indexOutfitsByUpdate(outfits, updates) {
	return indexBy(outfits, updates, "update");
}
export function indexMissionsByChallenge(missions, challenges) {
	return indexBy(missions, challenges, "challenge");
}
export function indexMissionsByLevel(missions, levels) {
	return indexBy(missions, levels, "level");
}
