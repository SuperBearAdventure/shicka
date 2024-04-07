import type {Localized} from "./utils/string.js";
import bearsBinding from "./bindings/bears.json" assert {type: "json"};
import challengesBinding from "./bindings/challenges.json" assert {type: "json"};
import levelsBinding from "./bindings/levels.json" assert {type: "json"};
import missionsBinding from "./bindings/missions.json" assert {type: "json"};
import outfitsBinding from "./bindings/outfits.json" assert {type: "json"};
import raritiesBinding from "./bindings/rarities.json" assert {type: "json"};
import updatesBinding from "./bindings/updates.json" assert {type: "json"};
type Bear = {
	id: number,
	name: Localized<string>,
	diamond: number,
	gold: number,
	level: number,
	outfits: number[],
	variations: number[]
};
type Challenge = {
	id: number,
	name: Localized<string>,
};
type Level = {
	id: number,
	name: Localized<string>,
	boss: Localized<string>,
	coins: number,
	stickers: number,
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
type Rarity = {
	id: number,
	name: Localized<string>,
	cost: number,
	payoffs: number[],
	probabilities: number[],
	slots: number,
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
type Binding = (Bear | Challenge | Level | Mission | Outfit | Rarity | Update)[];
function bind<Type>(array: Type[]): (Type & {id: number})[] {
	const binding: (Type & {id: number})[] = [];
	for (const [key, value] of array.entries()) {
		binding.push({...value, id: key});
	}
	return binding;
}
const bears: Bear[] = bind<Omit<Bear, "id">>(bearsBinding);
const challenges: Challenge[] = bind<Omit<Challenge, "id">>(challengesBinding);
const levels: Level[] = bind<Omit<Level, "id">>(levelsBinding);
const missions: Mission[] = bind<Omit<Mission, "id">>(missionsBinding);
const outfits: Outfit[] = bind<Omit<Outfit, "id">>(outfitsBinding);
const rarities: Rarity[] = bind<Omit<Rarity, "id">>(raritiesBinding);
const updates: Update[] = bind<Omit<Update, "id">>(updatesBinding);
export type {Binding as default};
export type {
	Bear,
	Challenge,
	Level,
	Mission,
	Outfit,
	Rarity,
	Update,
};
export {
	bears,
	challenges,
	levels,
	missions,
	outfits,
	rarities,
	updates,
};
