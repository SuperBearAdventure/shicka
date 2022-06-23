import discord from "discord.js";
import Command from "../command.js";
import {nearest} from "../utils/string.js"
const {Util} = discord;
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "UTC",
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeZone: "UTC",
});
const timeFormat = new Intl.DateTimeFormat("en-US", {
	timeStyle: "short",
	timeZone: "UTC",
});
const dayTime = timeFormat.format(new Date(36000000));
export default class MissionCommand extends Command {
	register(client, name) {
		const description = "Tells you what is playable in the shop or when it is playable";
		const options = [
			{
				type: "STRING",
				name: "mission",
				description: "Some mission",
				autocomplete: true,
			},
		];
		return {name, description, options};
	}
	async execute(interaction) {
		if (interaction.isAutocomplete()) {
			const {client, options} = interaction;
			const {bindings} = client;
			const {challenges, levels, missions} = bindings;
			const {name, value} = options.getFocused(true);
			if (name !== "mission") {
				await interaction.respond([]);
				return;
			}
			const results = nearest(value.toLowerCase(), missions, 7, (mission) => {
				const name = `${challenges[mission.challenge].name} in ${levels[mission.level].name}`;
				return name.toLowerCase();
			});
			const suggestions = results.map((mission) => {
				const name = `${challenges[mission.challenge].name} in ${levels[mission.level].name}`;
				return {
					name: name,
					value: name,
				};
			});
			await interaction.respond(suggestions);
			return;
		}
		const {client, options} = interaction;
		const {bindings} = client;
		const {challenges, levels, missions} = bindings;
		const missionCount = missions.length;
		const now = Math.floor((interaction.createdTimestamp + 7200000) / 86400000);
		const search = options.getString("mission");
		if (search == null) {
		const schedules = [];
		for (let k = -1; k < 2; ++k) {
			const day = now + k;
			const seed = (day % missionCount + missionCount) % missionCount;
			const mission = missions[seed];
			const challenge = challenges[mission.challenge].name;
			const level = levels[mission.level].name;
			const dayDate = dateFormat.format(new Date(day * 86400000));
			schedules.push(`\u{2022} *${Util.escapeMarkdown(dayDate)}*: **${Util.escapeMarkdown(challenge)}** in **${Util.escapeMarkdown(level)}**`);
		}
		const scheduleList = schedules.join("\n");
		await interaction.reply(`Each mission starts at *${Util.escapeMarkdown(dayTime)}*:\n${scheduleList}`);
		return;
		}
		const results = nearest(search.toLowerCase(), missions, 1, (mission) => {
			const name = `${challenges[mission.challenge].name} in ${levels[mission.level].name}`;
			return name.toLowerCase();
		});
		if (results.length === 0) {
			await interaction.reply({
				content: `I do not know any mission with this name.`,
				ephemeral: true,
			});
			return;
		}
		const mission = results[0];
		const schedules = [];
		for (let k = -1; k < 2 || schedules.length < 2; ++k) {
			const day = now + k;
			const seed = (day % missionCount + missionCount) % missionCount;
			if (missions[seed] === mission) {
				const dayDateTime = dateTimeFormat.format(new Date(day * 86400000 + 36000000));
				schedules.push(`\u{2022} *${Util.escapeMarkdown(dayDateTime)}*`);
			}
		}
		const challenge = challenges[mission.challenge].name;
		const level = levels[mission.level].name;
		const scheduleList = schedules.join("\n");
		await interaction.reply(`**${Util.escapeMarkdown(challenge)}** in **${Util.escapeMarkdown(level)}** will be playable for 1 day starting:\n${scheduleList}`);
	}
	describe(interaction, name) {
		return `Type \`/${name}\` to know what is playable in the shop\nType \`/${name} Some mission\` to know when \`Some mission\` is playable in the shop`;
	}
}
