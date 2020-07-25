import discord from "discord.js";
import fetch from "node-fetch";
import Command from "../command.js";
const {Util} = discord;
const options = {
	year: "numeric",
	month: "long",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
	second: "numeric",
	timeZoneName: "short",
	timeZone: "UTC",
	hour12: false,
};
export default class SpeedrunCommand extends Command {
	constructor() {
		super();
		this._currentCheck = Date.now();
	}
	async execute(message, parameters) {
		const previousCheck = this._currentCheck;
		this._currentCheck = Date.now();
		const date = new Date(previousCheck);
		const localeDate = date.toLocaleDateString("en-US", options);
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
					if (!found) {
						found = true;
						await message.channel.send(`These are the world records found since the previous request (${localeDate}):`);
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
					message.channel.send(`${user} set a new world record in the ${category} category: ${time}!\n${video}`);
				}
			}
			if (!found) {
				await message.channel.send(`No new world records were found since the previous request (${localeDate}).\nYou can check and watch the latest speedruns there:\nhttps://www.speedrun.com/super_bear_adventure`);
			}
		} catch (error) {
			console.warn(error);
			await message.channel.send("You can check and watch the latest speedruns there:\nhttps://www.speedrun.com/super_bear_adventure");
		}
	}
	async describe(command) {
		return `Type \`${command}\` to check the latest world records of the game`;
	}
}
