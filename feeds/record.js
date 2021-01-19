import discord from "discord.js";
import fetch from "node-fetch";
import schedule from "node-schedule";
import Feed from "../feed.js";
const {Util} = discord;
export default class RecordFeed extends Feed {
	schedule(client) {
		schedule.scheduleJob("1 3/6 * * *", async () => {
			const middle = Math.floor(Date.now() / 21600000) * 21600000;
			const start = middle - 10800000;
			const end = middle + 10800000;
			const messages = await this.execute(start, end);
			for (const guild of client.guilds.cache.values()) {
				const channel = guild.channels.cache.find((channel) => {
					return channel.name === "🏅records";
				});
				if (typeof channel === "undefined") {
					continue;
				}
				for (const message of messages) {
					await channel.send(message);
				}
			}
		});
	}
	async execute(start, end) {
		const messages = [];
		try {
			const levels = Object.create(null);
			loop: for (let i = 0;; i += 20) {
				const response = await fetch(`https://www.speedrun.com/api/v1/runs?game=9d3rrxyd&status=verified&orderby=verify-date&direction=desc&embed=category.variables,level&offset=${i}&max=20`);
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
					const {categories} = levels[levelId] ?? (levels[levelId] = {
						levelName: !Array.isArray(levelData) ? `${levelData.name}: ` : "",
						categories: Object.create(null),
					});
					const categoryData = category.data;
					const categoryId = categoryData.id;
					const {leaderboards} = categories[categoryId] ?? (categories[categoryId] = {
						categoryName: categoryData.name,
						leaderboards: Object.create(null),
					});
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
					leaderboards[leaderboardId] ?? (leaderboards[leaderboardId] = {
						leaderboardName: leaderboardData.length ? ` - ${leaderboardData.map((variable) => {
							return `${variable.values.values[values[variable.id]].label}`;
						}).join(", ")}` : "",
					});
				}
			}
			for (const levelId in levels) {
				const {levelName, categories} = levels[levelId];
				for (const categoryId in categories) {
					const {categoryName, leaderboards} = categories[categoryId];
					for (const leaderboardId in leaderboards) {
						const {leaderboardName} = leaderboards[leaderboardId];
						const response = await fetch(`https://www.speedrun.com/api/v1/leaderboards/9d3rrxyd/${levelId}/${categoryId}?${leaderboardId}status=verified&embed=players&top=1`);
						const {data} = await response.json();
						const {players, runs} = data;
						if (!runs.length) {
							continue;
						}
						const {status, times, videos} = runs[0].run;
						const date = Date.parse(status["verify-date"]);
						if (date <= start || date > end) {
							continue;
						}
						const player = players.data[0];
						const flag = "location" in player ? `:flag_${player.location.country.code.toLowerCase()}: ` : "";
						const name = "names" in player ? player.names.international : player.name;
						const user = `*${Util.escapeMarkdown(flag)}${Util.escapeMarkdown(name)}*`;
						const {primary_t} = times;
						const minutes = `${primary_t / 60 | 0}`.padStart(2, "0");
						const seconds = `${primary_t % 60 | 0}`.padStart(2, "0");
						const centiseconds = `${primary_t * 100 % 100 | 0}`.padStart(2, "0");
						const time = `**${Util.escapeMarkdown(`${minutes}:${seconds}.${centiseconds}`)}**`;
						const category = `*${Util.escapeMarkdown(`${levelName}${categoryName}${leaderboardName}`)}*`;
						const links = "links" in videos ? videos.links : [];
						const video = links.length ? `\n${links[0].uri}` : "";
						messages.push(`${user} set a new world record in the ${category} category: ${time}!${video}`);
					}
				}
			}
		} catch (error) {
			console.warn(error);
		}
		return messages;
	}
	async describe(message) {
		const channel = message.guild.channels.cache.find((channel) => {
			return channel.name === "🏅records";
		});
		if (typeof channel === "undefined") {
			return "";
		}
		return `I post the latest world records of the game in ${channel}`;
	}
}
