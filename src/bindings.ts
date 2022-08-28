import bearsBinding from "./bindings/bears.json" assert {type: "json"};
import challengesBinding from "./bindings/challenges.json" assert {type: "json"};
import levelsBinding from "./bindings/levels.json" assert {type: "json"};
import missionsBinding from "./bindings/missions.json" assert {type: "json"};
import outfitsBinding from "./bindings/outfits.json" assert {type: "json"};
import partsBinding from "./bindings/parts.json" assert {type: "json"};
import raritiesBinding from "./bindings/rarities.json" assert {type: "json"};
import updatesBinding from "./bindings/updates.json" assert {type: "json"};
type Bear = {
	id: number,
	name: {[k in string]: string},
	gold: number,
	level: number,
	outfits: number[],
};
type Challenge = {
	id: number,
	name: {[k in string]: string},
};
type Level = {
	id: number,
	name: {[k in string]: string},
	boss: {[k in string]: string},
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
	name: {[k in string]: string},
	cost: number,
	part: number,
	rarity: number,
	update: number,
};
type Part = {
	id: number,
	name: {[k in string]: string},
};
type Rarity = {
	id: number,
	name: {[k in string]: string},
	cost: number,
	payoff: number,
	probability: number,
	slots: number,
};
type Update = {
	id: number,
	name: string,
	date: {
		android: string | null,
		ios: string | null,
	},
	notes: string[],
};
type Binding = (Bear | Challenge | Level | Mission | Outfit | Part | Rarity | Update)[];
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
const parts: Part[] = bind<Omit<Part, "id">>(partsBinding);
const rarities: Rarity[] = bind<Omit<Rarity, "id">>(raritiesBinding);
const updates: Update[] = bind<Omit<Update, "id">>(updatesBinding);
export default Binding;
export type {
	Bear,
	Challenge,
	Level,
	Mission,
	Outfit,
	Part,
	Rarity,
	Update,
};
export {
	bears,
	challenges,
	levels,
	missions,
	outfits,
	parts,
	rarities,
	updates,
};
