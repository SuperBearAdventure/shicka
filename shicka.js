import discord from "discord.js";
import {
	loadActions,
	loadData,
	loadGreetings,
} from "./loader.js";
import {
	// indexBearsByLevel,
	// indexOutfitsByPart,
	indexOutfitsByRarity,
	// indexOutfitsByUpdate,
	// indexMissionsByChallenge,
	// indexMissionsByLevel,
} from "./indexer.js";
const {Client, Intents, Util} = discord;
const {
	SHICKA_DISCORD_TOKEN: discordToken,
	SHICKA_SALT: salt,
} = process.env;
const here = import.meta.url;
const root = here.slice(0, here.lastIndexOf("/"));
const grants = await loadActions(`${root}/grants`);
const commands = await loadActions(`${root}/commands`);
const feeds = await loadActions(`${root}/feeds`);
const triggers = await loadActions(`${root}/triggers`);
const data = await loadData(`${root}/data`);
const greetings = await loadGreetings(`${root}/greetings`);
// const bearsByLevel = indexBearByLevel(data.bears, data.levels);
// const outfitsByPart = indexOutfitsByPart(data.outfits, data.parts);
const outfitsByRarity = indexOutfitsByRarity(data.outfits, data.rarities);
// const outfitsByUpdate = indexOutfitsByUpdate(data.outfits, data.updates);
// const missionsByChallenge = indexMissionsByChallenge(data.missions, data.challenges);
// const missionsByLevel = indexMissionsByChallenge(data.missions, data.levels);
const indices = Object.assign(Object.create(null), {
	// bearsByLevel,
	// outfitsByPart,
	outfitsByRarity,
	// outfitsByUpdate,
	// missionsByChallenge,
	// missionsByLevel,
});
const capture = /^.*$/isu;
const outerSpace = /^[\n ]+|[\n ]+$/gu;
const innerSpace = /[\n ]+/gu;
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
	],
	presence: {
		activities: [
			{
				name: `/help - Super Bear Adventure`,
				type: "PLAYING",
			},
		],
		status: "online",
	},
});
client.salt = salt;
client.grants = grants;
client.commands = commands;
client.feeds = feeds;
client.triggers = triggers;
client.data = data;
client.greetings = greetings;
client.indices = indices;
client.once("ready", async (client) => {
	console.log("Ready!");
	const {commands, feeds} = client;
	const menu = Object.entries(commands).map(([name, command]) => {
		return command.register(client, name);
	});
	for (const guild of client.guilds.cache.values()) {
		guild.commands.set(menu);
	}
	for (const [name, feed] of Object.entries(feeds)) {
		const job = feed.register(client, name);
		job.on("error", (error) => {
			console.error(error);
		});
	}
});
client.on("guildMemberAdd", async (member) => {
	const {memberCount, systemChannel} = member.guild;
	const name = `${member}`;
	const greetings = member.client.greetings.hey;
	const greeting = name.replace(capture, greetings[Math.random() * greetings.length | 0]);
	const counting = memberCount % 10 !== 0 ? "" : `\nWe are now ${Util.escapeMarkdown(`${memberCount}`)} members!`;
	try {
		const message = await systemChannel.send(`${greeting}${counting}`);
		await message.react("🇭");
		await message.react("🇪");
		await message.react("🇾");
		await message.react("👋");
	} catch (error) {
		console.error(error);
	}
});
client.on("guildMemberRemove", async (member) => {
	const {systemChannel} = member.guild;
	const name = `**${Util.escapeMarkdown(member.user.username)}**`;
	const greetings = member.client.greetings.bye;
	const greeting = name.replace(capture, greetings[Math.random() * greetings.length | 0]);
	try {
		const message = await systemChannel.send(greeting);
		await message.react("🇧");
		await message.react("🇾");
		await message.react("🇪");
		await message.react("👋");
	} catch (error) {
		console.error(error);
	}
});
client.on("interactionCreate", async (interaction) => {
	if (interaction.user.bot || interaction.channel.type !== "GUILD_TEXT") {
		return;
	}
	const {commandName} = interaction;
	const {commands} = interaction.client;
	if (!(commandName in commands)) {
		return;
	}
	try {
		await commands[commandName].execute(interaction);
	} catch (error) {
		console.error(error);
	}
});
client.on("messageCreate", async (message) => {
	if (message.author.bot || message.channel.type !== "GUILD_TEXT") {
		return;
	}
	const {content} = message;
	if (!content.startsWith("/")) {
		return;
	}
	const parameters = content.slice(1).replace(outerSpace, "").split(innerSpace);
	if (parameters.length === 0) {
		return;
	}
	const grant = parameters[0];
	const {grants} = message.client;
	if (!(grant in grants)) {
		return;
	}
	try {
		await grants[grant].execute(message, parameters);
	} catch (error) {
		console.error(error);
	}
});
client.on("messageCreate", async (message) => {
	if (message.author.bot || message.channel.type !== "GUILD_TEXT") {
		return;
	}
	const {triggers} = message.client;
	for (const trigger in triggers) {
		try {
			await triggers[trigger].execute(message);
		} catch (error) {
			console.error(error);
		}
	}
});
await client.login(discordToken);
