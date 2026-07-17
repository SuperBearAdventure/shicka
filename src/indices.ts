import type {
	Bear,
	Level,
	Mission,
	Outfit,
	Sublevel,
} from "./bindings.js";
import {
	bears,
	challenges,
	levels,
	missions,
	outfits,
	rarities,
	sublevels,
	updates,
} from "./bindings.js";
type BearKey = keyof typeof bears;
type ChallengeKey = keyof typeof challenges;
type LevelKey = keyof typeof levels;
type MissionKey = keyof typeof missions;
type OutfitKey = keyof typeof outfits;
type RarityKey = keyof typeof rarities;
type SublevelKey = keyof typeof sublevels;
type UpdateKey = keyof typeof updates;
type IndexEntries<OtherKey extends string, OwnKey extends string, Value extends object> = {
	[k in OtherKey]?: {
		[k in OwnKey]?: Value
	}
};
type BearByLevelEntries = IndexEntries<LevelKey, BearKey, Bear>;
type LevelByLevelEntries = IndexEntries<LevelKey, LevelKey, Level>;
type MissionByChallengeEntries = IndexEntries<ChallengeKey, MissionKey, Mission>;
type MissionByLevelEntries = IndexEntries<LevelKey, MissionKey, Mission>;
type OutfitByRarityEntries = IndexEntries<RarityKey, OutfitKey, Outfit>;
type OutfitByUpdateEntries = IndexEntries<UpdateKey, OutfitKey, Outfit>;
type SublevelByLevelEntries = IndexEntries<LevelKey, SublevelKey, Sublevel>;
type Index = BearByLevelEntries | LevelByLevelEntries | MissionByChallengeEntries | MissionByLevelEntries | OutfitByRarityEntries | OutfitByUpdateEntries | SublevelByLevelEntries;
function indexBy<OtherKey extends string, OwnKey extends string, Value extends {[k in IndexKey]: OtherKey | null}, IndexKey extends string>(object: {[k in OwnKey]: Value}, indexKey: IndexKey): IndexEntries<OtherKey, OwnKey, Value> {
	const index: IndexEntries<OtherKey, OwnKey, Value> = Object.create(null);
	for (const [ownKey, value] of Object.entries(object) as [OwnKey, Value][]) {
		const otherKey: OtherKey | null = value[indexKey];
		if (otherKey == null) {
			continue;
		}
		(index[otherKey] ??= Object.create(null))[ownKey] = value;
	}
	return index;
}
const bearsByLevel: BearByLevelEntries = indexBy<LevelKey, BearKey, Bear, "level">(bears, "level");
const levelsByLevel: LevelByLevelEntries = indexBy<LevelKey, LevelKey, Level, "level">(levels, "level");
const missionsByChallenge: MissionByChallengeEntries = indexBy<ChallengeKey, MissionKey, Mission, "challenge">(missions, "challenge");
const missionsByLevel: MissionByLevelEntries = indexBy<LevelKey, MissionKey, Mission, "level">(missions, "level");
const outfitsByRarity: OutfitByRarityEntries = indexBy<RarityKey, OutfitKey, Outfit, "rarity">(outfits, "rarity");
const outfitsByUpdate: OutfitByUpdateEntries = indexBy<UpdateKey, OutfitKey, Outfit, "update">(outfits, "update");
const sublevelsByLevel: SublevelByLevelEntries = indexBy<LevelKey, SublevelKey, Sublevel, "level">(sublevels, "level");
export type {Index as default};
export type {
	Bear,
	Level,
	Mission,
	Outfit,
	Sublevel,
};
export {
	bearsByLevel,
	levelsByLevel,
	missionsByChallenge,
	missionsByLevel,
	outfitsByRarity,
	outfitsByUpdate,
	sublevelsByLevel,
};
