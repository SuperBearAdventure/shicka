import type {Localized} from "./utils/string.js";
import bearsBinding from "./bindings/bears.json" with {type: "json"};
import challengesBinding from "./bindings/challenges.json" with {type: "json"};
import levelsBinding from "./bindings/levels.json" with {type: "json"};
import missionsBinding from "./bindings/missions.json" with {type: "json"};
import outfitsBinding from "./bindings/outfits.json" with {type: "json"};
import racesBinding from "./bindings/races.json" with {type: "json"};
import raritiesBinding from "./bindings/rarities.json" with {type: "json"};
import sublevelsBinding from "./bindings/sublevels.json" with {type: "json"};
import updatesBinding from "./bindings/updates.json" with {type: "json"};
type BearKey = keyof typeof bearsBinding;
type ChallengeKey = keyof typeof challengesBinding;
type LevelKey = keyof typeof levelsBinding;
type MissionKey = keyof typeof missionsBinding;
type OutfitKey = keyof typeof outfitsBinding;
type RaceKey = keyof typeof racesBinding;
type RarityKey = keyof typeof raritiesBinding;
type SublevelKey = keyof typeof sublevelsBinding;
type UpdateKey = keyof typeof updatesBinding;
type BearValue = {
	name: Localized<string>,
	boss: Localized<string> | null,
	coins: number,
	diamond: number,
	gold: number,
	level: LevelKey,
	outfits: {
		[k in OutfitKey]?: number
	},
};
type ChallengeValue = {
	name: Localized<string>,
};
type LevelValue = {
	name: Localized<string>,
	chests: number,
	coins: number,
	stickers: number,
	level: LevelKey | null,
};
type MissionValue = {
	challenge: ChallengeKey,
	level: LevelKey,
};
type OutfitValue = {
	name: Localized<string>,
	cost: number,
	rarity: RarityKey,
	update: UpdateKey,
	variations: number,
};
type RaceValue = {
	name: Localized<string>,
};
type RarityValue = {
	name: Localized<string>,
	cost: number,
	payoffs: number[],
	probabilities: number[],
	slots: number,
	color: string,
};
type SublevelValue = {
	diamond: number,
	gold: number,
	level: LevelKey,
};
type UpdateValue = {
	date: {
		android: string | null,
		ios: string | null,
		switch: string | null,
	},
	notes: string[],
};
type BindingEntries<Key extends string, Value extends object> = {
	[k in Key]: Value & {
		index: number,
		key: k,
	}
};
type BearEntries = BindingEntries<BearKey, BearValue>;
type ChallengeEntries = BindingEntries<ChallengeKey, ChallengeValue>;
type LevelEntries = BindingEntries<LevelKey, LevelValue>;
type MissionEntries = BindingEntries<MissionKey, MissionValue>;
type OutfitEntries = BindingEntries<OutfitKey, OutfitValue>;
type RaceEntries = BindingEntries<RaceKey, RaceValue>;
type RarityEntries = BindingEntries<RarityKey, RarityValue>;
type SublevelEntries = BindingEntries<SublevelKey, SublevelValue>;
type UpdateEntries = BindingEntries<UpdateKey, UpdateValue>;
type Mission = MissionEntries[MissionKey];
type Level = LevelEntries[LevelKey];
type Bear = BearEntries[BearKey];
type Challenge = ChallengeEntries[ChallengeKey];
type Outfit = OutfitEntries[OutfitKey];
type Race = RaceEntries[RaceKey];
type Rarity = RarityEntries[RarityKey];
type Sublevel = SublevelEntries[SublevelKey];
type Update = UpdateEntries[UpdateKey];
type Binding = BearEntries | ChallengeEntries | LevelEntries | MissionEntries | OutfitEntries | RaceEntries | RarityEntries | SublevelEntries | UpdateEntries;
function bind<Key extends string, Value extends object>(object: {[k in Key]: Value}): BindingEntries<Key, Value> {
	const binding: BindingEntries<Key, Value> = Object.fromEntries([...(Object.entries(object) as [Key, Value][]).entries()].map<[Key, BindingEntries<Key, Value>[Key]]>(([index, [key, value]]: [number, [Key, Value]]): [Key, BindingEntries<Key, Value>[Key]] => {
		return [key, {...value, index, key}];
	})) as BindingEntries<Key, Value>;
	return binding;
}
const bears: BearEntries = bind<BearKey, BearValue>(bearsBinding as {[k in BearKey]: BearValue});
const challenges: ChallengeEntries = bind<ChallengeKey, ChallengeValue>(challengesBinding as {[k in ChallengeKey]: ChallengeValue});
const levels: LevelEntries = bind<LevelKey, LevelValue>(levelsBinding as {[k in LevelKey]: LevelValue});
const missions: MissionEntries = bind<MissionKey, MissionValue>(missionsBinding as {[k in MissionKey]: MissionValue});
const outfits: OutfitEntries = bind<OutfitKey, OutfitValue>(outfitsBinding as {[k in OutfitKey]: OutfitValue});
const races: RaceEntries = bind<RaceKey, RaceValue>(racesBinding as {[k in RaceKey]: RaceValue});
const rarities: RarityEntries = bind<RarityKey, RarityValue>(raritiesBinding as {[k in RarityKey]: RarityValue});
const sublevels: SublevelEntries = bind<SublevelKey, SublevelValue>(sublevelsBinding as {[k in SublevelKey]: SublevelValue});
const updates: UpdateEntries = bind<UpdateKey, UpdateValue>(updatesBinding as {[k in UpdateKey]: UpdateValue});
export type {Binding as default};
export type {
	Bear,
	Challenge,
	Level,
	Mission,
	Outfit,
	Race,
	Rarity,
	Sublevel,
	Update,
};
export {
	bears,
	challenges,
	levels,
	missions,
	outfits,
	races,
	rarities,
	sublevels,
	updates,
};
