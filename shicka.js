import discord from "discord.js";
import {load} from "./loader.js";
const {Client} = discord;
const outerSpace = /^[\n ]+|[\n ]+$/gu;
const innerSpace = /[\n ]+/gu;
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
	if (message.author.bot || message.channel.type !== "text") {
		return;
	}
	const {client, content} = message;
	const {prefix} = client;
	if (!content.startsWith(prefix)) {
		return;
	}
	const parameters = content.slice(prefix.length).replace(outerSpace, "").split(innerSpace);
	if (!parameters.length) {
		return;
	}
	const command = parameters[0];
	const {commands} = client;
	if (!commands.has(command)) {
		return;
	}
	await commands.get(command).execute(message, parameters);
});
client.on("message", async (message) => {
	if (message.author.bot || message.channel.type !== "text") {
		return;
	}
	for (const trigger of message.client.triggers.values()) {
		await trigger.execute(message);
	}
});
(async () => {
	const {
		SHICKA_DISCORD_TOKEN: discordToken,
		SHICKA_PREFIX: prefix,
	} = process.env;
	const [commands, triggers] = await load(["commands", "triggers"]);
	client.prefix = prefix;
	client.commands = commands;
	client.triggers = triggers;
	client.login(discordToken);
})();
