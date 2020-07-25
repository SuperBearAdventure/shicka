import discord from "discord.js";
import fetch from "node-fetch";
import schedule from "node-schedule";
import Feed from "../feed.js";
const {Util} = discord;
export default class RecordFeed extends Feed {
	schedule(client) {
		schedule.scheduleJob("1 3/6 * * *", async () => {
			const middle = (Date.now() / 21600000 | 0) * 21600000;
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
			const categories = new Map();
			loop: for (let i = 0;; i += 20) {
				const response = await fetch(`https://www.speedrun.com/api/v1/runs?game=9d3rrxyd&status=verified&orderby=verify-date&direction=desc&embed=category.variables&offset=${i}&max=20`);
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
					if (level !== null) {
						continue;
					}
					const categoryData = category.data;
					if (categoryData.miscellaneous) {
						continue;
					}
					const categoryId = categoryData.id;
					if (!categories.has(categoryId)) {
						categories.set(categoryId, {
							categoryName: categoryData.name,
							leaderboards: new Map(),
							variables: categoryData.variables.data.filter((variable) => {
								return variable["is-subcategory"] && variable.mandatory;
							}),
						});
					}
					const {leaderboards, variables} = categories.get(categoryId);
					const leaderboardId = variables.map((variable) => {
						const variableId = variable.id;
						return `var-${variableId}=${values[variableId]}&`;
					}).join("");
					if (!leaderboards.has(leaderboardId)) {
						leaderboards.set(leaderboardId,  variables.map((variable) => {
							return `${variable.values.values[values[variable.id]].label}`;
						}).join(", "));
					}
				}
			}
			for (const [categoryId, {categoryName, leaderboards}] of categories) {
				for (const [leaderboardId, leaderboardName] of leaderboards) {
					const response = await fetch(`https://www.speedrun.com/api/v1/leaderboards/9d3rrxyd/category/${categoryId}?${leaderboardId}status=verified&embed=players&top=1`);
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
					const flag = player.location.country.code.toLowerCase();
					const name = player.names.international;
					const user = `*:flag_${Util.escapeMarkdown(flag)}: ${Util.escapeMarkdown(name)}*`;
					const {primary_t} = times;
					const minutes = `${primary_t / 60 | 0}`.padStart(2, "0");
					const seconds = `${primary_t % 60 | 0}`.padStart(2, "0");
					const centiseconds = `${primary_t * 100 % 100 | 0}`.padStart(2, "0");
					const time = `**${Util.escapeMarkdown(`${minutes}:${seconds}.${centiseconds}`)}**`;
					const category = `*${Util.escapeMarkdown(`${categoryName}${leaderboardName && ` - ${leaderboardName}`}`)}*`;
					const video = videos.links[0].uri;
					messages.push(`${user} set a new world record in the ${category} category: ${time}!\n${video}`);
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
