import discord from "discord.js";
import jsdom from "jsdom";
import fetch from "node-fetch";
const {Client, Util} = discord;
const {JSDOM} = jsdom;
const token = process.argv[2];
let currentCheck = Date.now();
const commands = [
	{
		pattern: /^!count *$/isu,
		async execute(message) {
			const {memberCount} = message.guild;
			await message.channel.send(`There are ${memberCount} members on the official *Super Bear Adventure* *Discord* server!`);
		},
	},
	{
		pattern: /^!trailer *$/isu,
		async execute(message) {
			await message.channel.send(`Watch the official trailer of *Super Bear Adventure* on *Earthkwak Games* *YouTube* channel!\nhttps://youtu.be/L00uorYTYgE`);
		},
	},
	{
		pattern: /^!update *$/isu,
		async execute(message) {
			try {
				const {window} = await JSDOM.fromURL("https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer");
				const versionElement = window.document.querySelector(".IxB2fe > :nth-child(4) > :nth-child(2) > :nth-child(1) > :nth-child(1)");
				if (versionElement === null) {
					throw new Error("No version found");
				}
				const dateElement = window.document.querySelector(".IxB2fe > :nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(1)");
				if (dateElement === null) {
					throw new Error("No date found");
				}
				const version = `**${Util.escapeMarkdown(versionElement.textContent)}**`;
				const date = `*${Util.escapeMarkdown(dateElement.textContent)}*`;
				await message.channel.send(`The last update of the game is ${version} (${date}).`);
			} catch (error) {
				console.warn(error);
				await message.channel.send("You can check and download the latest update of the game here:\nhttps://play.google.com/store/apps/details?id=com.Earthkwak.Platformer");
			}
		},
	},
	{
		pattern: /^!speedrun *$/isu,
		async execute(message) {
			try {
				const previousCheck = currentCheck;
				currentCheck = Date.now();
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
		},
	},
	{
		pattern: /\b(?:ios|ipad|iphone|multi-?player|online|pc)\b/isu,
		async execute(message) {
			const emoji = message.guild.emojis.cache.find((emoji) => {
				return emoji.name === "RULE7";
			});
			if (typeof emoji !== "undefined") {
				await message.channel.send(`${emoji}`);
			}
			const channel = message.guild.channels.cache.find((channel) => {
				return channel.name === "❗rules❗";
			});
			if (typeof channel !== "undefined") {
				await message.reply(`Please read and respect the ${channel}!`);
			}
			await message.react("🇷");
			await message.react("🇺");
			await message.react("🇱");
			await message.react("🇪");
			await message.react("7️⃣");
		},
	},
];
const client = new Client();
client.once("ready", async () => {
	await client.user.setPresence({
		activity: {
			name: "Super Bear Adventure",
			type: "PLAYING",
		},
		status: "online",
	});
	console.log("Ready!");
});
client.on("message", async (message) => {
	const {content} = message;
	for (const {pattern, execute} of commands) {
		const array = content.match(pattern);
		if (array === null) {
			continue;
		}
		const [, ...parameters] = array;
		await execute(message, ...parameters);
		break;
	}
});
client.login(token);
