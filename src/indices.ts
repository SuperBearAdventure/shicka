import type {
	Bear,
	Challenge,
	Level,
	Mission,
	Outfit,
	Race,
	Rarity,
	Update,
} from "./bindings.js";
import {
	bears,
	challenges,
	levels,
	missions,
	outfits,
	// races,
	rarities,
	updates,
} from "./bindings.js";
type Index = (Bear | Challenge | Level | Mission | Outfit | Race | Rarity | Update)[][];
function indexBy<Left extends {[k in Key]: number}, Right, Key extends string>(leftArray: Left[], rightArray: Right[], key: Key): Left[][] {
	const index: Left[][] = Array.from<Right, Left[]>(rightArray, (): Left[] => {
		return [];
	});
	for (const value of leftArray) {
		index[value[key]].push(value);
	}
	return index;
}
function indexBearsByLevel(bears: Bear[], levels: Level[]): Bear[][] {
	return indexBy<Bear, Level, "level">(bears, levels, "level");
}
function indexMissionsByChallenge(missions: Mission[], challenges: Challenge[]): Mission[][] {
	return indexBy<Mission, Challenge, "challenge">(missions, challenges, "challenge");
}
function indexMissionsByLevel(missions: Mission[], levels: Level[]): Mission[][] {
	return indexBy<Mission, Level, "level">(missions, levels, "level");
}
function indexOutfitsByRarity(outfits: Outfit[], rarities: Rarity[]): Outfit[][] {
	return indexBy<Outfit, Rarity, "rarity">(outfits, rarities, "rarity");
}
function indexOutfitsByUpdate(outfits: Outfit[], updates: Update[]): Outfit[][] {
	return indexBy<Outfit, Update, "update">(outfits, updates, "update");
}
const bearsByLevel: Bear[][] = indexBearsByLevel(bears, levels);
const missionsByChallenge: Mission[][] = indexMissionsByChallenge(missions, challenges);
const missionsByLevel: Mission[][] = indexMissionsByLevel(missions, levels);
const outfitsByRarity: Outfit[][] = indexOutfitsByRarity(outfits, rarities);
const outfitsByUpdate: Outfit[][] = indexOutfitsByUpdate(outfits, updates);
export type {Index as default};
export type {
	Bear,
	Mission,
	Outfit,
};
export {
	bearsByLevel,
	missionsByChallenge,
	missionsByLevel,
	outfitsByRarity,
	outfitsByUpdate,
};
