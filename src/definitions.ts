import type {Localized} from "./utils/string.js";
import aboutDefinition from "./definitions/about.json" assert {type: "json"};
import arrivalDefinition from "./definitions/arrival.json" assert {type: "json"};
import bearDefinition from "./definitions/bear.json" assert {type: "json"};
import chatDefinition from "./definitions/chat.json" assert {type: "json"};
import countDefinition from "./definitions/count.json" assert {type: "json"};
import departureDefinition from "./definitions/departure.json" assert {type: "json"};
import emojiDefinition from "./definitions/emoji.json" assert {type: "json"};
import helpDefinition from "./definitions/help.json" assert {type: "json"};
import leaderboardDefinition from "./definitions/leaderboard.json" assert {type: "json"};
import missionDefinition from "./definitions/mission.json" assert {type: "json"};
import outfitDefinition from "./definitions/outfit.json" assert {type: "json"};
import rawDefinition from "./definitions/raw.json" assert {type: "json"};
import recordDefinition from "./definitions/record.json" assert {type: "json"};
import roadmapDefinition from "./definitions/roadmap.json" assert {type: "json"};
import rule7Definition from "./definitions/rule7.json" assert {type: "json"};
import soundtrackDefinition from "./definitions/soundtrack.json" assert {type: "json"};
import storeDefinition from "./definitions/store.json" assert {type: "json"};
import trackerDefinition from "./definitions/tracker.json" assert {type: "json"};
import trailerDefinition from "./definitions/trailer.json" assert {type: "json"};
import updateDefinition from "./definitions/update.json" assert {type: "json"};
type About = {
	commandName: string,
	commandDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
};
type Arrival = {
	hookName: string,
	hookReason: string,
	helpWithChannel: Localized<string>,
	helpWithoutChannel: Localized<string>,
	greetings: string[],
};
type Bear = {
	commandName: string,
	commandDescription: Localized<string>,
	bearOptionName: string,
	bearOptionDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
	noOutfit: Localized<string>,
	bossGoal: Localized<string>,
	coinsWithBossGoal: Localized<string>,
	coinsWithoutBossGoal: Localized<string>,
	timeWithBossOrCoinsGoal: Localized<string>,
	timeWithoutBossAndCoinsGoal: Localized<string>,
	noGoal: Localized<string>,
};
type Chat = {
	commandName: string,
	commandDescription: Localized<string>,
	postSubCommandName: string,
	postSubCommandDescription: Localized<string>,
	patchSubCommandName: string,
	patchSubCommandDescription: Localized<string>,
	attachSubCommandName: string,
	attachSubCommandDescription: Localized<string>,
	detachSubCommandName: string,
	detachSubCommandDescription: Localized<string>,
	channelOptionName: string,
	channelOptionDescription: Localized<string>,
	messageOptionName: string,
	messageOptionDescription: Localized<string>,
	contentOptionName: string,
	contentOptionDescription: Localized<string>,
	positionOptionName: string,
	positionOptionDescription: Localized<string>,
	attachmentOptionName: string,
	attachmentOptionDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
	bareReply: Localized<string>,
	noChannelReply: Localized<string>,
	noMessageReply: Localized<string>,
	noPositionReply: Localized<string>,
	noInteractionReply: Localized<string>,
	noContentOrAttachmentReply: Localized<string>,
	noPatchPermissionReply: Localized<string>,
	noPostPermissionReply: Localized<string>,
};
type Count = {
	commandName: string,
	commandDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
};
type Departure = {
	hookName: string,
	hookReason: string,
	helpWithChannel: Localized<string>,
	helpWithoutChannel: Localized<string>,
	greetings: string[],
};
type Emoji = {
	commandName: string,
	commandDescription: Localized<string>,
	baseOptionName: string,
	baseOptionDescription: Localized<string>,
	stylesOptionName: string,
	stylesOptionDescription: Localized<string>,
	help: Localized<string>,
};
type Help = {
	commandName: string,
	commandDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
};
type Leaderboard = {
	commandName: string,
	commandDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
	link: Localized<string>,
};
type Mission = {
	commandName: string,
	commandDescription: Localized<string>,
	missionOptionName: string,
	missionOptionDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
	bareReply: Localized<string>,
	missionName: Localized<string>,
	schedule: Localized<string>,
	bareSchedule: Localized<string>,
};
type Outfit = {
	commandName: string,
	commandDescription: Localized<string>,
	outfitOptionName: string,
	outfitOptionDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
	bareReply: Localized<string>,
	noSlotReply: Localized<string>,
	tokensCost: Localized<string>,
	coinsCost: Localized<string>,
	noCost: Localized<string>,
	schedule: Localized<string>,
	bareSchedule: Localized<string>,
};
type Raw = {
	commandName: string,
	commandDescription: Localized<string>,
	typeOptionName: string,
	typeOptionDescription: Localized<string>,
	identifierOptionName: string,
	identifierOptionDescription: Localized<string>,
	help: Localized<string>,
	noTypeReply: Localized<string>,
	noIdentifierReply: Localized<string>,
};
type Record = {
	hookName: string,
	hookReason: string,
	helpWithChannel: Localized<string>,
	helpWithoutChannel: Localized<string>,
};
type Roadmap = {
	commandName: string,
	commandDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
	intentWithChannel: Localized<string>,
	intentWithoutChannel: Localized<string>,
};
type Rule7 = {
	ruleName: string,
	ruleReason: string,
	helpWithChannels: Localized<string>,
	helpWithoutChannels: Localized<string>,
};
type Soundtrack = {
	commandName: string,
	commandDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
	defaultReply: Localized<string>,
	link: Localized<string>,
};
type Store = {
	commandName: string,
	commandDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
	link: Localized<string>,
};
type Tracker = {
	commandName: string,
	commandDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
	intentWithChannel: Localized<string>,
	intentWithoutChannel: Localized<string>,
	link: Localized<string>,
};
type Trailer = {
	commandName: string,
	commandDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
	defaultReply: Localized<string>,
	link: Localized<string>,
};
type Update = {
	commandName: string,
	commandDescription: Localized<string>,
	help: Localized<string>,
	reply: Localized<string>,
	defaultReply: Localized<string>,
	link: Localized<string>,
};
type Definition = About | Arrival | Bear | Chat | Count | Departure | Emoji | Help | Leaderboard | Mission | Outfit | Raw | Record | Roadmap | Rule7 | Soundtrack | Store | Tracker | Trailer | Update;
const about: About = aboutDefinition;
const arrival: Arrival = arrivalDefinition;
const bear: Bear = bearDefinition;
const chat: Chat = chatDefinition;
const count: Count = countDefinition;
const departure: Departure = departureDefinition;
const emoji: Emoji = emojiDefinition;
const help: Help = helpDefinition;
const leaderboard: Leaderboard = leaderboardDefinition;
const mission: Mission = missionDefinition;
const outfit: Outfit = outfitDefinition;
const raw: Raw = rawDefinition;
const record: Record = recordDefinition;
const roadmap: Roadmap = roadmapDefinition;
const rule7: Rule7 = rule7Definition;
const soundtrack: Soundtrack = soundtrackDefinition;
const store: Store = storeDefinition;
const tracker: Tracker = trackerDefinition;
const trailer: Trailer = trailerDefinition;
const update: Update = updateDefinition;
export type {Definition as default};
export type {
	About,
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
	roadmap,
	rule7,
	soundtrack,
	store,
	tracker,
	trailer,
	update,
};
