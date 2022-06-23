import {Util} from "discord.js";
import fetch from "node-fetch";
import schedule from "node-schedule";
const games = ["9d3rrxyd", "w6jl2ned"];
const recordFeed = {
	register(client, name) {
		return schedule.scheduleJob({
			rule: "1 3/6 * * *",
			tz: "UTC",
		}, async (timestamp) => {
			const middle = Math.floor(timestamp.getTime() / 21600000) * 21600000;
			const start = middle - 10800000;
			const end = middle + 10800000;
			const records = await this.execute(start, end);
			for (const guild of client.guilds.cache.values()) {
				const channel = guild.channels.cache.find((channel) => {
					return channel.name === "🏅・records";
				});
				if (channel == null || !("messages" in channel)) {
					continue;
				}
				for (const record of records) {
					const message = await channel.send(record);
					await message.react("🎉");
				}
			}
		});
	},
	async execute(start, end) {
		const records = [];
		try {
			for (const gameId of games) {
				const levels = Object.create(null);
				loop: for (let i = 0;; i += 20) {
					const response = await fetch(`https://www.speedrun.com/api/v1/runs?game=${gameId}&status=verified&orderby=verify-date&direction=desc&embed=category.variables,level&offset=${i}&max=20`);
					const {data, pagination} = await response.json();
					if (pagination.size === 0) {
						break;
					}
					for (const {category, level, status, values} of data) {
						const date = Date.parse(status["verify-date"]);
						if (date <= start) {
							break loop;
						}
						if (date > end) {
							continue;
						}
						const levelData = level.data;
						const levelId = !Array.isArray(levelData) ? `level/${levelData.id}` : "category";
						const {categories} = levels[levelId] ??= {
							levelName: !Array.isArray(levelData) ? `${levelData.name}: ` : "",
							categories: Object.create(null),
						};
						const categoryData = category.data;
						const categoryId = categoryData.id;
						const {leaderboards} = categories[categoryId] ??= {
							categoryName: categoryData.name,
							leaderboards: Object.create(null),
						};
						const leaderboardData = categoryData.variables.data.filter((variable) => {
							if (!variable["is-subcategory"]) {
								return false;
							}
							const variableScope = variable.scope;
							return variableScope.type !== "single-level" || `level/${variableScope.level}` === levelId;
						});
						const leaderboardId = leaderboardData.map((variable) => {
							const variableId = variable.id;
							return `var-${variableId}=${values[variableId]}&`;
						}).join("");
						leaderboards[leaderboardId] ??= {
							leaderboardName: leaderboardData.length !== 0 ? ` - ${leaderboardData.map((variable) => {
								return `${variable.values.values[values[variable.id]].label}`;
							}).join(", ")}` : "",
						};
					}
				}
				for (const levelId in levels) {
					const {levelName, categories} = levels[levelId];
					for (const categoryId in categories) {
						const {categoryName, leaderboards} = categories[categoryId];
						for (const leaderboardId in leaderboards) {
							const {leaderboardName} = leaderboards[leaderboardId];
							const response = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameId}/${levelId}/${categoryId}?${leaderboardId}status=verified&embed=players&top=1`);
							const {data} = await response.json();
							const {players, runs} = data;
							if (runs.length === 0) {
								continue;
							}
							const {status, times, videos} = runs[0].run;
							const date = Date.parse(status["verify-date"]);
							if (date <= start || date > end) {
								continue;
							}
							const player = players.data[0];
							const flag = "location" in player ? `${player.location.country.code.slice(0, 2).split("").map((string) => {
								const character = string.codePointAt(0);
								if (character == null) {
									return "";
								}
								return String.fromCodePoint(character + 127365);
							}).join("")} ` : "";
							const name = "names" in player ? player.names.international : player.name;
							const user = `${flag}${name}`;
							const {primary_t} = times;
							const minutes = `${primary_t / 60 | 0}`.padStart(2, "0");
							const seconds = `${primary_t % 60 | 0}`.padStart(2, "0");
							const centiseconds = `${primary_t * 100 % 100 | 0}`.padStart(2, "0");
							const time = `${minutes}:${seconds}.${centiseconds}`;
							const category = `${levelName}${categoryName}${leaderboardName}`;
							const links = "links" in videos ? videos.links : [];
							const video = links.length !== 0 ? `\n${links[0].uri}` : "";
							records.push(`*${Util.escapeMarkdown(user)}* set a new world record in the *${Util.escapeMarkdown(category)}* category: **${Util.escapeMarkdown(time)}**!${video}`);
						}
					}
				}
			}
		} catch (error) {
			console.warn(error);
		}
		return records;
	},
	describe(interaction, name) {
		const {guild} = interaction;
		if (guild == null) {
			return null;
		}
		const channel = guild.channels.cache.find((channel) => {
			return channel.name === "🏅・records";
		});
		if (channel == null) {
			return null;
		}
		return `I post the latest world records of the game in ${channel}`;
	},
};
export default recordFeed;
