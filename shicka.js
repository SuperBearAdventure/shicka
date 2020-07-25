import discord from "discord.js";
import {load} from "./loader.js";
const {Client, Util} = discord;
const bigNumbers = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
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
	for (const feed of client.feeds.values()) {
		feed.schedule(client);
	}
});
client.on("guildMemberAdd", async (member) => {
	const {systemChannel} = member.guild;
	const greeting = `${member} entered the server!`;
	const counting = memberCount % 10 ? "" : `\nWe are now ${memberCount} members!`;
	const message = await systemChannel.send(`${greeting}${counting}`);
	await message.react("🇭");
	await message.react("🇪");
	await message.react("🇾");
	await message.react("👋");
	if (memberCount % 1000) {
		return;
	}
	const memberString = `${memberCount / 1000}`;
	for (const memberCharacter of memberString) {
		await message.react(bigNumbers[memberCharacter])
	}
	await message.react("🇰");
	await message.react("🎉");
	await message.react("🥳");
});
client.on("guildMemberRemove", async (member) => {
	const message = await member.guild.systemChannel.send(`**${Util.escapeMarkdown(member.user.username)}** exited the server...`);
	await message.react("🇧");
	await message.react("🇾");
	await message.react("🇪");
	await message.react("👋");
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
	const [commands, feeds, triggers] = await load(["commands", "feeds", "triggers"]);
	client.prefix = prefix;
	client.commands = commands;
	client.feeds = feeds;
	client.triggers = triggers;
	client.login(discordToken);
})();
