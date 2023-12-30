import type {
	Client,
	Message,
} from "discord.js";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";
import type {Response} from "node-fetch";
import type {Record as RecordCompilation} from "../compilations.js";
import type {Record as RecordDefinition} from "../definitions.js";
import type {Record as RecordDependency} from "../dependencies.js";
import type Hook from "../hooks.js";
import type {Webhook, WebhookData, WebjobInvocation} from "../hooks.js";
import type {Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import canvas from "canvas";
import fetch from "node-fetch";
import {record as recordCompilation} from "../compilations.js";
import {record as recordDefinition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpWithChannelGroups = RecordDependency["helpWithChannel"];
type Leaderboard = {
	leaderboardName: string,
};
type Category = {
	categoryName: string,
	leaderboards: {[k in string]: Leaderboard},
};
type Level = {
	levelName: string,
	categories: {[k in string]: Category},
};
type Data = {
	title: string,
	content: string,
};
const {
	hookName,
	hookReason,
}: RecordDefinition = recordDefinition;
const {
	helpWithChannel: helpWithChannelLocalizations,
	helpWithoutChannel: helpWithoutChannelLocalizations,
}: RecordCompilation = recordCompilation;
const {
	SHICKA_RECORD_DEFAULT_CHANNEL,
}: NodeJS.ProcessEnv = process.env;
const {createCanvas, loadImage}: any = canvas;
const hookChannel: string = SHICKA_RECORD_DEFAULT_CHANNEL ?? "";
const hookAvatar: string = await (async (): Promise<string> => {
	const url: string = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 64 64" width="256" height="256"><circle cx="16" cy="16" r="24" fill="#ccc"/><path d="M16,5L18,14L26,13L19,17L23,25L16,19L9,25L13,17L6,13L14,14Z" fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"/></svg>`;
	const image: Image = await loadImage(url);
	const canvas: Canvas = createCanvas(256, 256);
	const context: CanvasRenderingContext2D = canvas.getContext("2d");
	context.drawImage(image, 0, 0, 256, 256);
	const data: string = canvas.toDataURL();
	return data;
})();
const jobRule: string = "1 3/6 * * *";
const jobTz: string = "UTC";
const games: string[] = ["9d3rrxyd", "w6jl2ned"];
const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
async function fetchData(start: number, end: number): Promise<Data[] | null> {
	try {
		const records: Data[] = [];
		for (const gameId of games) {
			const levels: {[k in string]: Level} = Object.create(null);
			loop: for (let i: number = 0;; i += 20) {
				const response: Response = await fetch(`https://www.speedrun.com/api/v1/runs?game=${gameId}&status=verified&orderby=verify-date&direction=desc&embed=category.variables,level&offset=${i}&max=20`);
				const {data, pagination}: any = await response.json();
				if (pagination.size === 0) {
					break;
				}
				for (const {category, level, status, values} of data) {
					const date: number = Date.parse(status["verify-date"]);
					if (date <= start) {
						break loop;
					}
					if (date > end) {
						continue;
					}
					const levelData: any = level.data;
					const levelId: string = !Array.isArray(levelData) ? `level/${levelData.id}` : "category";
					const {categories}: Level = levels[levelId] ??= {
						levelName: !Array.isArray(levelData) ? `${levelData.name}: ` : "",
						categories: Object.create(null),
					};
					const categoryData: any = category.data;
					const categoryId: string = categoryData.id;
					const {leaderboards}: Category = categories[categoryId] ??= {
						categoryName: categoryData.name,
						leaderboards: Object.create(null),
					};
					const leaderboardData: any = categoryData.variables.data.filter((variable: any): boolean => {
						if (!variable["is-subcategory"]) {
							return false;
						}
						const variableScope: any = variable.scope;
						return variableScope.type !== "single-level" || `level/${variableScope.level}` === levelId;
					});
					const leaderboardId: string = leaderboardData.map((variable: any): string => {
						const variableId: string = variable.id;
						return `var-${variableId}=${values[variableId]}&`;
					}).join("");
					leaderboards[leaderboardId] ??= {
						leaderboardName: leaderboardData.length !== 0 ? ` - ${leaderboardData.map((variable: any): string => {
							return `${variable.values.values[values[variable.id]].label}`;
						}).join(", ")}` : "",
					};
				}
			}
			for (const levelId in levels) {
				const {levelName, categories}: Level = levels[levelId];
				for (const categoryId in categories) {
					const {categoryName, leaderboards}: Category = categories[categoryId];
					for (const leaderboardId in leaderboards) {
						const {leaderboardName}: Leaderboard = leaderboards[leaderboardId];
						const response: Response = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameId}/${levelId}/${categoryId}?${leaderboardId}status=verified&embed=players&top=1`);
						const {data}: any = await response.json();
						if (data.runs.length === 0) {
							continue;
						}
						const {run}: any = data.runs[0];
						const date: number = Date.parse(run.status["verify-date"]);
						if (date <= start || date > end) {
							continue;
						}
						const players: string[] = [];
						for (const {location, name, names} of data.players.data) {
							const playerName: string | null = names?.international ?? name ?? null;
							if (playerName == null) {
								continue;
							}
							const playerFlag: string | null = location?.country?.code?.slice?.(0, 2).split("").map((string: string): string => {
								const character: number | undefined = string.codePointAt(0);
								if (character == null) {
									return "";
								}
								return String.fromCodePoint(character + 127365);
							}).join("") ?? null;
							const player: string = `${playerFlag != null ? `${playerFlag} ` : ""}${playerName}`;
							players.push(`*${escapeMarkdown(player)}*`)
						}
						const playerConjunction: string = players.length !== 0 ? conjunctionFormat.format(players) : "Someone";
						const primary_t: number | null = run?.times?.primary_t ?? null;
						const time: string = primary_t != null ? ((): string => {
							const minutes: string = `${primary_t / 60 | 0}`.padStart(2, "0");
							const seconds: string = `${primary_t % 60 | 0}`.padStart(2, "0");
							const centiseconds: string = `${primary_t * 100 % 100 | 0}`.padStart(2, "0");
							const time: string = `${minutes}:${seconds}.${centiseconds}`;
							return `: **${escapeMarkdown(time)}**`;
						})() : "";
						const category: string = `${levelName}${categoryName}${leaderboardName}`;
						const page: string | null = run?.weblink ?? null
						const pageLink: string = page != null ?`[a new world record](<${page}>)` : "a new world record";
						const videos: string[] = [];
						for (const {uri} of run?.videos?.links ?? []) {
							if (uri == null) {
								continue;
							}
							videos.push(uri);
						}
						const videoLinkLine: string = videos.length !== 0 ? `\n${videos.join(" ")}` : "";
						records.push({
							title: `New world record in ${escapeMarkdown(category)}`,
							content: `${playerConjunction} set ${pageLink} in the *${escapeMarkdown(category)}* category${time}!${videoLinkLine}`,
						});
					}
				}
			}
		}
		return records;
	} catch {}
	return null;
};
const recordHook: Hook = {
	register(): WebhookData {
		return {
			type: "cronWebjobInvocation",
			hookOptions: {
				name: hookName,
				reason: hookReason,
				channel: hookChannel,
				avatar: hookAvatar,
			},
			jobOptions: {
				rule: jobRule,
				tz: jobTz,
			},
		};
	},
	async invoke(invocation: WebjobInvocation): Promise<void> {
		if (invocation.event.type !== "cronWebjobInvocation") {
			return;
		}
		const [timestamp]: [timestamp: Date] = invocation.event.data;
		const middle: number = Math.floor(timestamp.getTime() / 21600000) * 21600000;
		const start: number = middle - 10800000;
		const end: number = middle + 10800000;
		const data: Data[] | null = await fetchData(start, end);
		if (data == null) {
			throw new Error();
		}
		const {client, webhooks}: WebjobInvocation = invocation;
		const {user}: Client<true> = client;
		const applicationName: string = user.username;
		const applicationIcon: string = user.displayAvatarURL();
		for (const webhook of webhooks) {
			const {channel}: Webhook = webhook;
			for (const item of data) {
				const record: string = item.content;
				const category: string = item.title;
				const message: Message<boolean> = await webhook.send({
					content: record,
					username: applicationName,
					avatarURL: applicationIcon,
					...(channel != null && channel.isThreadOnly() ? {threadName: category} : {}),
				});
				try {
					await message.react("🎉");
				} catch {}
			}
		}
	},
	describe(webhook: Webhook): Localized<(groups: {}) => string> {
		const {channel}: Webhook = webhook;
		return channel != null ? composeAll<HelpWithChannelGroups, {}>(helpWithChannelLocalizations, localize<HelpWithChannelGroups>((): HelpWithChannelGroups => {
			return {
				channelMention: (): string => {
					return `<#${channel.id}>`;
				},
			};
		})) : helpWithoutChannelLocalizations;
	},
};
export default recordHook;
