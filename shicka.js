import discord from "discord.js";
import {
	loadActions,
	loadData,
	loadGreetings,
	// indexBearsByLevel,
	// indexItemsByPart,
	indexItemsByRarity,
	// indexItemsByUpdate,
	// indexMissionsByChallenge,
	// indexMissionsByLevel,
} from "./loader.js";
const {Client, Util} = discord;
const {
	SHICKA_DISCORD_TOKEN: discordToken,
	SHICKA_PREFIX: prefix,
	SHICKA_SALT: salt,
} = process.env;
const bigNumbers = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
const capture = /^.*$/isu;
const outerSpace = /^[\n ]+|[\n ]+$/gu;
const innerSpace = /[\n ]+/gu;
const client = new Client({
	presence: {
		activity: {
			name: `${prefix}help - Super Bear Adventure`,
			type: "PLAYING",
		},
		status: "online",
	},
});
client.once("ready", async () => {
	console.log("Ready!");
	const {feeds} = client;
	for (const feed in feeds) {
		feeds[feed].schedule(client);
	}
});
client.on("guildMemberAdd", async (member) => {
	const {memberCount, systemChannel} = member.guild;
	const name = `${member}`;
	const greetings = client.greetings.hey;
	const greeting = name.replace(capture, greetings[Math.random() * greetings.length | 0]);
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
	const {systemChannel} = member.guild;
	const name = `**${Util.escapeMarkdown(member.user.username)}**`;
	const greetings = client.greetings.bye;
	const greeting = name.replace(capture, greetings[Math.random() * greetings.length | 0]);
	const message = await systemChannel.send(greeting);
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
	if (!(command in commands)) {
		return;
	}
	await commands[command].execute(message, parameters);
});
client.on("message", async (message) => {
	if (message.author.bot || message.channel.type !== "text") {
		return;
	}
	const {triggers} = client;
	for (const trigger in triggers) {
		await triggers[trigger].execute(message);
	}
});
(async () => {
	const [
		commands,
		feeds,
		triggers,
	] = await loadActions([
		"commands",
		"feeds",
		"triggers",
	]);
	const greetings = await loadGreetings();
	const [
		bears,
		challenges,
		items,
		levels,
		parts,
		rarities,
		missions,
		updates,
	] = await loadData([
		"bears.json",
		"challenges.json",
		"items.json",
		"levels.json",
		"parts.json",
		"rarities.json",
		"missions.json",
		"updates.json",
	]);
	// const bearsByLevel = await indexBearByLevel(bears, levels);
	// const itemsByPart = await indexItemsByPart(items, parts);
	const itemsByRarity = await indexItemsByRarity(items, rarities);
	// const itemsByUpdate = await indexItemsByUpdate(items, updates);
	// const missionsByChallenge = await indexMissionsByChallenge(missions, challenges);
	// const missionsByLevel = await indexMissionsByChallenge(missions, levels);
	client.prefix = prefix;
	client.salt = salt;
	client.commands = commands;
	client.feeds = feeds;
	client.triggers = triggers;
	client.greetings = greetings;
	client.data = Object.assign(Object.create(null), {
		bears,
		challenges,
		items,
		levels,
		parts,
		rarities,
		missions,
		updates,
	});
	client.indices = Object.assign(Object.create(null), {
		// bearsByLevel,
		// itemsByPart,
		itemsByRarity,
		// itemsByUpdate,
		// missionsByChallenge,
		// missionsByLevel,
	});
	client.login(discordToken);
})();
