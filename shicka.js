import discord from "discord.js";
import {HelpCommand} from "./help.js";
import {CountCommand} from "./count.js";
import {TrailerCommand} from "./trailer.js";
import {UpdateCommand} from "./update.js";
import {SpeedrunCommand} from "./speedrun.js";
import {AboutCommand} from "./about.js";
import {Rule7Command} from "./rule7.js";
const {Client} = discord;
const {DISCORD_TOKEN} = process.env;
const commands = [];
commands.push(
	new HelpCommand(commands),
	new CountCommand(),
	new TrailerCommand(),
	new UpdateCommand(),
	new SpeedrunCommand(),
	new AboutCommand(),
	new Rule7Command(),
);
const client = new Client({
	presence: {
		activity: {
			name: "Super Bear Adventure",
			type: "PLAYING",
		},
		status: "online",
	},
});
client.once("ready", async () => {
	console.log("Ready!");
});
client.on("message", async (message) => {
	if (message.author.bot) {
		return;
	}
	const {content} = message;
	for (const command of commands) {
		const parameters = command.test(content);
		if (parameters === null) {
			continue;
		}
		await command.execute(message, ...parameters);
		break;
	}
});
client.login(DISCORD_TOKEN);
