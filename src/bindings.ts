import bearsBinding from "./bindings/bears.json" assert {type: "json"};
import challengesBinding from "./bindings/challenges.json" assert {type: "json"};
import levelsBinding from "./bindings/levels.json" assert {type: "json"};
import missionsBinding from "./bindings/missions.json" assert {type: "json"};
import outfitsBinding from "./bindings/outfits.json" assert {type: "json"};
import partsBinding from "./bindings/parts.json" assert {type: "json"};
import raritiesBinding from "./bindings/rarities.json" assert {type: "json"};
import updatesBinding from "./bindings/updates.json" assert {type: "json"};
function bind(array) {
	const binding = [];
	for (const [key, value] of array.entries()) {
		binding.push({...value, id: key});
	}
	return binding;
}
const bears = bind(bearsBinding);
const challenges = bind(challengesBinding);
const levels = bind(levelsBinding);
const missions = bind(missionsBinding);
const outfits = bind(outfitsBinding);
const parts = bind(partsBinding);
const rarities = bind(raritiesBinding);
const updates = bind(updatesBinding);
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
