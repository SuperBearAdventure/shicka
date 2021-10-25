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
			},
		];
		return {name, description, options};
	}
	async execute(interaction) {
		const {client, options} = interaction;
		const {data} = client;
		const {challenges, levels, missions} = data;
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
			schedules.push(`- *${Util.escapeMarkdown(dayDate)}*: **${Util.escapeMarkdown(challenge)}** in **${Util.escapeMarkdown(level)}**`);
		}
		const scheduleList = schedules.join("\n");
		await interaction.reply(`Each mission starts at *${Util.escapeMarkdown(dayTime)}*:\n${scheduleList}`);
		return;
		}
		const mission = nearest(search.toLowerCase(), missions, (mission) => {
			return `${challenges[mission.challenge].name} in ${levels[mission.level].name}`.toLowerCase();
		});
		if (mission == null) {
			await interaction.reply({
				content: `I do not know any mission with this name.`,
				ephemeral: true,
			});
			return;
		}
		const schedules = [];
		for (let k = -1; k < 2 || schedules.length < 2; ++k) {
			const day = now + k;
			const seed = (day % missionCount + missionCount) % missionCount;
			if (missions[seed] === mission) {
				const dayDateTime = dateTimeFormat.format(new Date(day * 86400000 + 36000000));
				schedules.push(`- *${Util.escapeMarkdown(dayDateTime)}*`);
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
