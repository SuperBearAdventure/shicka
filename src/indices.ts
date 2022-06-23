import {
	bears,
	challenges,
	levels,
	missions,
	outfits,
	parts,
	rarities,
	updates,
} from "./bindings.js";
function indexBy(leftArray, rightArray, key) {
	const index = Array.from(rightArray, () => {
		return [];
	});
	for (const value of leftArray) {
		index[value[key]].push(value);
	}
	return index;
}
function indexBearsByLevel(bears, levels) {
	return indexBy(bears, levels, "level");
}
function indexMissionsByChallenge(missions, challenges) {
	return indexBy(missions, challenges, "challenge");
}
function indexMissionsByLevel(missions, levels) {
	return indexBy(missions, levels, "level");
}
function indexOutfitsByPart(outfits, parts) {
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
function indexOutfitsByRarity(outfits, rarities) {
	return indexBy(outfits, rarities, "rarity");
}
function indexOutfitsByUpdate(outfits, updates) {
	return indexBy(outfits, updates, "update");
}
const bearsByLevel = indexBearsByLevel(bears, levels);
const missionsByChallenge = indexMissionsByChallenge(missions, challenges);
const missionsByLevel = indexMissionsByLevel(missions, levels);
const outfitsByPart = indexOutfitsByPart(outfits, parts);
const outfitsByRarity = indexOutfitsByRarity(outfits, rarities);
const outfitsByUpdate = indexOutfitsByUpdate(outfits, updates);
export {
	bearsByLevel,
	missionsByChallenge,
	missionsByLevel,
	outfitsByPart,
	outfitsByRarity,
	outfitsByUpdate,
};
