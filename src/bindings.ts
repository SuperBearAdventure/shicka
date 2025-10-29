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
type Bear = {
	id: number,
	name: Localized<string>,
	boss: Localized<string> | null,
	coins: number,
	diamond: number,
	gold: number,
	level: number,
	outfits: number[],
	variations: number[],
};
type Challenge = {
	id: number,
	name: Localized<string>,
};
type Level = {
	id: number,
	name: Localized<string>,
	chests: number,
	coins: number,
	stickers: number,
	level: number,
};
type Mission = {
	id: number,
	challenge: number,
	level: number,
};
type Outfit = {
	id: number,
	name: Localized<string>,
	cost: number,
	rarity: number,
	update: number,
	variations: number,
};
type Race = {
	id: number,
	name: Localized<string>,
};
type Rarity = {
	id: number,
	name: Localized<string>,
	cost: number,
	payoffs: number[],
	probabilities: number[],
	slots: number,
};
type Sublevel = {
	id: number,
	diamond: number,
	gold: number,
	level: number,
};
type Update = {
	id: number,
	name: string,
	date: {
		android: string | null,
		ios: string | null,
		switch: string | null,
	},
	notes: string[],
};
type Binding = (Bear | Challenge | Level | Mission | Outfit | Race | Rarity | Sublevel | Update)[];
function bind<Type>(array: Type[]): (Type & {id: number})[] {
	const binding: (Type & {id: number})[] = [];
	for (const [key, value] of array.entries()) {
		binding.push({...value, id: key});
	}
	return binding;
}
const outfitsMapping: {[k in string]: number} = Object.fromEntries(Object.keys(outfitsBinding).map<[string, number]>((key: string, index: number): [string, number] => {
	return [key, index];
}));
const outfitsBindingAsArray: Omit<Outfit, "id">[] = Object.values(outfitsBinding);
const bearsBindingAsArray: Omit<Bear, "id">[] = bearsBinding.map<Omit<Bear, "id">>((bear: Omit<Bear, "outfits" | "variations" | "id"> & {"outfits": {[k in string]: number}}): Omit<Bear, "id"> => {
	return {
		...bear,
		outfits: Object.keys(bear.outfits).map<number>((key: string): number => {
			return outfitsMapping[key];
		}),
		variations: Object.values(bear.outfits),
	};
});
const bears: Bear[] = bind<Omit<Bear, "id">>(bearsBindingAsArray);
const challenges: Challenge[] = bind<Omit<Challenge, "id">>(challengesBinding);
const levels: Level[] = bind<Omit<Level, "id">>(levelsBinding);
const missions: Mission[] = bind<Omit<Mission, "id">>(missionsBinding);
const outfits: Outfit[] = bind<Omit<Outfit, "id">>(outfitsBindingAsArray);
const races: Race[] = bind<Omit<Race, "id">>(racesBinding);
const rarities: Rarity[] = bind<Omit<Rarity, "id">>(raritiesBinding);
const sublevels: Sublevel[] = bind<Omit<Sublevel, "id">>(sublevelsBinding);
const updates: Update[] = bind<Omit<Update, "id">>(updatesBinding);
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
