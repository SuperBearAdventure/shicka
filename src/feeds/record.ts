import type {
	ChatInputCommandInteraction,
	Client,
	GuildBasedChannel,
	Message,
} from "discord.js";
import type {Response} from "node-fetch";
import type {Job} from "node-schedule";
import type {Record as RecordCompilation} from "../compilations.js";
import type {Record as RecordDependency} from "../dependencies.js";
import type Feed from "../feeds.js";
import type {Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import fetch from "node-fetch";
import schedule from "node-schedule";
import {record as recordCompilation} from "../compilations.js";
import {composeAll, localize} from "../utils/string.js";
type HelpGroups = RecordDependency["help"];
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
const {
	help: helpLocalizations,
}: RecordCompilation = recordCompilation;
const games: string[] = ["9d3rrxyd", "w6jl2ned"];
const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
const recordFeed: Feed = {
	register(client: Client): Job {
		return schedule.scheduleJob({
			rule: "1 3/6 * * *",
			tz: "UTC",
		}, async (timestamp: Date): Promise<void> => {
			const middle: number = Math.floor(timestamp.getTime() / 21600000) * 21600000;
			const start: number = middle - 10800000;
			const end: number = middle + 10800000;
			const records: string[] = await this.execute(start, end);
			for (const guild of client.guilds.cache.values()) {
				const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
					return channel.name === "🏅│records";
				});
				if (channel == null || !channel.isTextBased()) {
					continue;
				}
				for (const record of records) {
					const message: Message<true> = await channel.send({
						content: record,
					});
					await message.react("🎉");
				}
			}
		});
	},
	async execute(start: number, end: number): Promise<string[]> {
		const records: string[] = [];
		try {
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
							const primary_t: number = run?.times?.primary_t ?? null;
							const minutes: string = `${primary_t / 60 | 0}`.padStart(2, "0");
							const seconds: string = `${primary_t % 60 | 0}`.padStart(2, "0");
							const centiseconds: string = `${primary_t * 100 % 100 | 0}`.padStart(2, "0");
							const time: string = `${minutes}:${seconds}.${centiseconds}`;
							const category: string = `${levelName}${categoryName}${leaderboardName}`;
							const videos: string[] = [];
							for (const {uri} of run?.videos?.links ?? []) {
								if (uri == null) {
									continue;
								}
								videos.push(uri);
							}
							const linkLine: string = videos.length !== 0 ? `\n${videos.join(" ")}` : "";
							records.push(`${playerConjunction} set a new world record in the *${escapeMarkdown(category)}* category: **${escapeMarkdown(time)}**!${linkLine}`);
						}
					}
				}
			}
		} catch (error: unknown) {
			console.warn(error);
		}
		return records;
	},
	describe(interaction: ChatInputCommandInteraction<"cached">): Localized<(groups: {}) => string> | null {
		const {guild}: ChatInputCommandInteraction<"cached"> = interaction;
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "🏅│records";
		});
		if (channel == null) {
			return null;
		}
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				channel: (): string => {
					return `${channel}`;
				},
			};
		}));
	},
};
export default recordFeed;
