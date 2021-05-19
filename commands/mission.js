import discord from "discord.js";
import Command from "../command.js";
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
const time = timeFormat.format(new Date(36000000));
export default class MissionCommand extends Command {
	async execute(message, parameters) {
		const {challenges, levels, missions} = message.client.data;
		const missionCount = missions.length;
		const now = Math.floor((Date.now() + 7200000) / 86400000);
		const search = parameters.slice(1).join(" ").toLowerCase();
		if (search === "") {
		const sample = [];
		for (let k = -1; k < 2; ++k) {
			const date = now + k;
			const seed = (date % missionCount + missionCount) % missionCount;
			const mission = missions[seed];
			const challenge = challenges[mission.challenge].name;
			const level = levels[mission.level].name;
			const name = `**${Util.escapeMarkdown(challenge)}** in **${Util.escapeMarkdown(level)}**`;
			const day = dateFormat.format(new Date(date * 86400000));
			sample.push(`- *${Util.escapeMarkdown(day)}*: ${name}`);
		}
		const schedule = sample.join("\n");
		await message.channel.send(`Each mission starts at *${Util.escapeMarkdown(time)}*:\n${schedule}`);
		return;
		}
		const mission = missions.find((mission) => {
			const name = `${challenges[mission.challenge].name} in ${levels[mission.level].name}`;
			return name.toLowerCase() === search;
		});
		if (typeof mission === "undefined") {
			await message.channel.send(`I do not know any mission with this name.`);
			return;
		}
		const sample = [];
		for (let k = -1; k < 2 || sample.length < 2; ++k) {
			const date = now + k;
			const seed = (date % missionCount + missionCount) % missionCount;
			if (missions[seed] === mission) {
				const dateTime = dateTimeFormat.format(new Date(date * 86400000 + 36000000));
				sample.push(`- *${Util.escapeMarkdown(dateTime)}*`);
			}
		}
		const challenge = challenges[mission.challenge].name;
		const level = levels[mission.level].name;
		const name = `**${Util.escapeMarkdown(challenge)}** in **${Util.escapeMarkdown(level)}**`;
		const schedule = sample.join("\n");
		await message.channel.send(`${name} will be playable for 1 day starting:\n${schedule}`);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know the schedule of missions\nType \`${command} Some mission\` to know when \`Some mission\` is playable`;
	}
}
