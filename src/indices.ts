import type {
	Bear,
	Challenge,
	Level,
	Mission,
	Outfit,
	Part,
	Rarity,
	Update,
} from "./bindings.js";
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
type Index = (Bear | Challenge | Level | Mission | Outfit | Part | Rarity | Update)[][];
function indexBy<Left extends {[k in Key]: number}, Right, Key extends string>(leftArray: Left[], rightArray: Right[], key: Key): Left[][] {
	const index: Left[][] = Array.from(rightArray, (): Left[] => {
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
function indexOutfitsByPart(outfits: Outfit[], parts: Part[]): Outfit[][] {
	const outfitsByPart: Outfit[][] = indexBy<Outfit, Part, "part">(outfits, parts, "part");
	for (const outfits of outfitsByPart) {
		outfits.sort((a: Outfit, b: Outfit): number => {
			const aRarity: number = a.rarity;
			const bRarity: number = b.rarity;
			if (aRarity > bRarity) {
				return 1;
			}
			if (aRarity < bRarity) {
				return -1;
			}
			const aName: string = a.name.toLowerCase();
			const bName: string = b.name.toLowerCase();
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
function indexOutfitsByRarity(outfits: Outfit[], rarities: Rarity[]): Outfit[][] {
	return indexBy<Outfit, Rarity, "rarity">(outfits, rarities, "rarity");
}
function indexOutfitsByUpdate(outfits: Outfit[], updates: Update[]): Outfit[][] {
	return indexBy<Outfit, Update, "update">(outfits, updates, "update");
}
const bearsByLevel: Bear[][] = indexBearsByLevel(bears, levels);
const missionsByChallenge: Mission[][] = indexMissionsByChallenge(missions, challenges);
const missionsByLevel: Mission[][] = indexMissionsByLevel(missions, levels);
const outfitsByPart: Outfit[][] = indexOutfitsByPart(outfits, parts);
const outfitsByRarity: Outfit[][] = indexOutfitsByRarity(outfits, rarities);
const outfitsByUpdate: Outfit[][] = indexOutfitsByUpdate(outfits, updates);
export default Index;
export type {
	Bear,
	Mission,
	Outfit,
};
export {
	bearsByLevel,
	missionsByChallenge,
	missionsByLevel,
	outfitsByPart,
	outfitsByRarity,
	outfitsByUpdate,
};
