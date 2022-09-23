import type {
	Client,
	CommandInteraction,
	GuildBasedChannel,
	Message,
} from "discord.js";
import type {Response} from "node-fetch";
import type {Job} from "node-schedule";
import type Feed from "../feeds.js";
import type {Localized} from "../utils/string.js";
import {Util} from "discord.js";
import fetch from "node-fetch";
import schedule from "node-schedule";
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
const games: string[] = ["9d3rrxyd", "w6jl2ned"];
const helpLocalizations: Localized<(channel: GuildBasedChannel) => string> = Object.assign(Object.create(null), {
	"en-US"(channel: GuildBasedChannel): string {
		return `I post the latest world records of the game in ${channel}`;
	},
	"fr"(channel: GuildBasedChannel): string {
		return `Je poste les derniers records du monde du jeu dans ${channel}`;
	},
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
				if (channel == null || !("messages" in channel)) {
					continue;
				}
				for (const record of records) {
					const message: Message = await channel.send(record);
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
							const {players, runs}: any = data;
							if (runs.length === 0) {
								continue;
							}
							const {status, times, videos}: any = runs[0].run;
							const date: number = Date.parse(status["verify-date"]);
							if (date <= start || date > end) {
								continue;
							}
							const player: any = players.data[0];
							const flag: string = "location" in player ? `${player.location.country.code.slice(0, 2).split("").map((string: string): string => {
								const character: number | undefined = string.codePointAt(0);
								if (character == null) {
									return "";
								}
								return String.fromCodePoint(character + 127365);
							}).join("")} ` : "";
							const name: string = "names" in player ? player.names.international : player.name;
							const user: string = `${flag}${name}`;
							const {primary_t}: any = times;
							const minutes: string = `${primary_t / 60 | 0}`.padStart(2, "0");
							const seconds: string = `${primary_t % 60 | 0}`.padStart(2, "0");
							const centiseconds: string = `${primary_t * 100 % 100 | 0}`.padStart(2, "0");
							const time: string = `${minutes}:${seconds}.${centiseconds}`;
							const category: string = `${levelName}${categoryName}${leaderboardName}`;
							const links: any = "links" in videos ? videos.links : [];
							const video: string = links.length !== 0 ? `\n${links[0].uri}` : "";
							records.push(`*${Util.escapeMarkdown(user)}* set a new world record in the *${Util.escapeMarkdown(category)}* category: **${Util.escapeMarkdown(time)}**!${video}`);
						}
					}
				}
			}
		} catch (error: unknown) {
			console.warn(error);
		}
		return records;
	},
	describe(interaction: CommandInteraction): Localized<() => string> {
		const {guild}: CommandInteraction = interaction;
		if (guild == null) {
			return Object.create(null);
		}
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "🏅│records";
		});
		if (channel == null) {
			return Object.create(null);
		}
		return Object.assign(Object.create(null), Object.fromEntries(Object.entries(helpLocalizations).map(([key, value]: [string, ((channel: GuildBasedChannel) => string) | undefined]): [string, (() => string) | undefined] => {
			return [
				key,
				value != null ? (): string => {
					return value(channel);
				} : value,
			];
		})));
	},
};
export default recordFeed;
