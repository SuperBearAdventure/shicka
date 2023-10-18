import aboutCompilation from "./compilations/about.js";
import approvalCompilation from "./compilations/approval.js";
import arrivalCompilation from "./compilations/arrival.js";
import bearCompilation from "./compilations/bear.js";
import chatCompilation from "./compilations/chat.js";
import countCompilation from "./compilations/count.js";
import departureCompilation from "./compilations/departure.js";
import emojiCompilation from "./compilations/emoji.js";
import helpCompilation from "./compilations/help.js";
import leaderboardCompilation from "./compilations/leaderboard.js";
import missionCompilation from "./compilations/mission.js";
import outfitCompilation from "./compilations/outfit.js";
import rawCompilation from "./compilations/raw.js";
import recordCompilation from "./compilations/record.js";
import refusalCompilation from "./compilations/refusal.js";
import roadmapCompilation from "./compilations/roadmap.js";
import rule7Compilation from "./compilations/rule7.js";
import soundtrackCompilation from "./compilations/soundtrack.js";
import storeCompilation from "./compilations/store.js";
import trackerCompilation from "./compilations/tracker.js";
import trailerCompilation from "./compilations/trailer.js";
import updateCompilation from "./compilations/update.js";
type About = typeof aboutCompilation;
type Approval = typeof approvalCompilation;
type Arrival = typeof arrivalCompilation;
type Bear = typeof bearCompilation;
type Chat = typeof chatCompilation;
type Count = typeof countCompilation;
type Departure = typeof departureCompilation;
type Emoji = typeof emojiCompilation;
type Help = typeof helpCompilation;
type Leaderboard = typeof leaderboardCompilation;
type Mission = typeof missionCompilation;
type Outfit = typeof outfitCompilation;
type Raw = typeof rawCompilation;
type Record = typeof recordCompilation;
type Refusal = typeof refusalCompilation;
type Roadmap = typeof roadmapCompilation;
type Rule7 = typeof rule7Compilation;
type Soundtrack = typeof soundtrackCompilation;
type Store = typeof storeCompilation;
type Tracker = typeof trackerCompilation;
type Trailer = typeof trailerCompilation;
type Update = typeof updateCompilation;
type Compilation = About | Approval | Arrival | Bear | Chat | Count | Departure | Emoji | Help | Leaderboard | Mission | Outfit | Raw | Record | Refusal | Roadmap | Rule7 | Soundtrack | Store | Tracker | Trailer | Update;
const about: About = aboutCompilation;
const approval: Approval = approvalCompilation;
const arrival: Arrival = arrivalCompilation;
const bear: Bear = bearCompilation;
const chat: Chat = chatCompilation;
const count: Count = countCompilation;
const departure: Departure = departureCompilation;
const emoji: Emoji = emojiCompilation;
const help: Help = helpCompilation;
const leaderboard: Leaderboard = leaderboardCompilation;
const mission: Mission = missionCompilation;
const outfit: Outfit = outfitCompilation;
const raw: Raw = rawCompilation;
const record: Record = recordCompilation;
const refusal: Refusal = refusalCompilation;
const roadmap: Roadmap = roadmapCompilation;
const rule7: Rule7 = rule7Compilation;
const soundtrack: Soundtrack = soundtrackCompilation;
const store: Store = storeCompilation;
const tracker: Tracker = trackerCompilation;
const trailer: Trailer = trailerCompilation;
const update: Update = updateCompilation;
export type {Compilation as default};
export type {
	About,
	Approval,
	Arrival,
	Bear,
	Chat,
	Count,
	Departure,
	Emoji,
	Help,
	Leaderboard,
	Mission,
	Outfit,
	Raw,
	Record,
	Refusal,
	Roadmap,
	Rule7,
	Soundtrack,
	Store,
	Tracker,
	Trailer,
	Update,
};
export {
	about,
	approval,
	arrival,
	bear,
	chat,
	count,
	departure,
	emoji,
	help,
	leaderboard,
	mission,
	outfit,
	raw,
	record,
	refusal,
	roadmap,
	rule7,
	soundtrack,
	store,
	tracker,
	trailer,
	update,
};
