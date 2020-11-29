import discord from "discord.js";
import Command from "../command.js";
const {Util} = discord;
const dateFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeZone: "UTC",
});
const timeFormat = new Intl.DateTimeFormat("en-US", {
	timeStyle: "short",
	timeZone: "UTC",
});
const time = timeFormat.format(new Date(36000000));
const missions = [
	"**Floor is lava** in **Turtle Village**",
	"**Rally** in **Beemothep Desert**",
	"**Egg hunt** in **Snow Valley**",
	"**Parkour** in **Beemothep Desert**",
	"**Electricity issue** in **Giant House**",
	"**Floor is lava** in **Snow Valley**",
	"**Egg hunt** in **Turtle Village**",
	"**Flooding** in **Beemothep Desert**",
	"**Paper plane flight** in **Giant House**",
	"**Parkour** in **Snow Valley**",
];
const missionCount = missions.length;
export default class MissionCommand extends Command {
	async execute(message, parameters) {
		const now = Math.floor((Date.now() + 7200000) / 86400000);
		const sample = [];
		for (let k = -1; k < 2; ++k) {
			const date = now + k;
			const mission = missions[(date % missionCount + missionCount) % missionCount];
			const day = dateFormat.format(new Date(date * 86400000));
			sample.push(`- *${Util.escapeMarkdown(day)}*: ${mission}`);
		}
		const schedule = sample.join("\n");
		await message.channel.send(`Each mission starts at *${Util.escapeMarkdown(time)}* (local time):\n${schedule}`);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know the schedule of missions`;
	}
}
