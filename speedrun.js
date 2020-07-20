import discord from "discord.js";
import fetch from "node-fetch";
import {Command} from "./command.js";
const {Util} = discord;
const pattern = /^!speedrun *$/isu;
async function execute(previousCheck, message) {
	try {
		const categories = new Map();
		loop: for (let i = 0;; i += 20) {
			const response = await fetch(`https://www.speedrun.com/api/v1/runs?game=9d3rrxyd&status=verified&orderby=verify-date&direction=desc&embed=category.variables&offset=${i}&max=20`);
			const {data, pagination} = await response.json();
			if (pagination.size === 0) {
				break;
			}
			for (const {category, level, status, values} of data) {
				if (Date.parse(status["verify-date"]) <= previousCheck) {
					break loop;
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
		let found = false;
		for (const [categoryId, {categoryName, leaderboards}] of categories) {
			for (const [leaderboardId, leaderboardName] of leaderboards) {
				const response = await fetch(`https://www.speedrun.com/api/v1/leaderboards/9d3rrxyd/category/${categoryId}?${leaderboardId}status=verified&embed=players&top=1`);
				const {data} = await response.json();
				const {players, runs} = data;
				if (!runs.length) {
					continue;
				}
				const {status, times, videos} = runs[0].run;
				if (Date.parse(status["verify-date"]) <= previousCheck) {
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
				const video = Util.escapeMarkdown(videos.links[0].uri);
				await message.channel.send(`${user} set a new world record in the ${category} category: ${time}!\n${video}`);
				if (!found) {
					found = true;
				}
			}
		}
		if (!found) {
			throw new Error("No new world record found");
		}
	} catch (error) {
		console.warn(error);
		await message.reply("You can check and watch the latest speedruns here:\nhttps://www.speedrun.com/super_bear_adventure");
	}
}
export class SpeedrunCommand extends Command {
	constructor() {
		super(pattern, (message, ...parameters) => {
			const previousCheck = this._currentCheck;
			this._currentCheck = Date.now();
			execute(previousCheck, message, ...parameters);
		});
		this._currentCheck = Date.now();
	}
}
