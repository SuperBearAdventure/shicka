import {Client, Intents, Util} from "discord.js";
import * as commands from "./commands.js";
import * as feeds from "./feeds.js";
import * as grants from "./grants.js";
import * as triggers from "./triggers.js";
import * as greetings from "./greetings.js";
const {
	SHICKA_DISCORD_TOKEN: discordToken = "",
} = process.env;
const capture = /^.*$/su;
const parameter = /([^\n ]+)/u;
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
client.once("ready", async (client) => {
	console.log("Ready!");
	const menu = Object.keys(commands).map((commandName) => {
		const command = commands[commandName];
		return command.register(commandName);
	});
	for (const guild of client.guilds.cache.values()) {
		guild.commands.set(menu);
	}
	for (const feedName of Object.keys(feeds)) {
		const feed = feeds[feedName];
		const job = feed.register(client, feedName);
		job.on("error", (error) => {
			console.error(error);
		});
	}
});
client.on("guildMemberAdd", async (member) => {
	const {memberCount, systemChannel} = member.guild;
	if (systemChannel == null) {
		return;
	}
	const name = `${member}`;
	const {hey} = greetings;
	const greeting = name.replace(capture, hey[Math.random() * hey.length | 0]);
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
	if (systemChannel == null) {
		return;
	}
	const name = `**${Util.escapeMarkdown(member.user.username)}**`;
	const {bye} = greetings;
	const greeting = name.replace(capture, bye[Math.random() * bye.length | 0]);
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
	if (interaction.user.bot || interaction.channel == null) {
		return;
	}
	const {channel} = interaction;
	if (channel == null || !("name" in channel)) {
		return;
	}
	if (!interaction.isAutocomplete() && !interaction.isCommand()) {
		return;
	}
	const {commandName} = interaction;
	if (!(commandName in commands)) {
		return;
	}
	try {
		const command = commands[commandName];
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
	}
});
client.on("messageCreate", async (message) => {
	if (message.author.bot) {
		return;
	}
	const {channel} = message;
	if (!("name" in channel)) {
		return;
	}
	const {content} = message;
	if (!content.startsWith("/")) {
		return;
	}
	const tokens = content.split(parameter);
	const parameters = tokens.filter((token, index) => {
		return index % 2 === 1;
	});
	const grantName = parameters[0].slice(1);
	if (!(grantName in grants)) {
		return;
	}
	try {
		const grant = grants[grantName];
		await grant.execute(message, parameters, tokens);
	} catch (error) {
		console.error(error);
	}
});
client.on("messageCreate", async (message) => {
	if (message.author.bot) {
		return;
	}
	const {channel} = message;
	if (!("name" in channel)) {
		return;
	}
	for (const triggerName in triggers) {
		try {
			const trigger = triggers[triggerName];
			await trigger.execute(message);
		} catch (error) {
			console.error(error);
		}
	}
});
await client.login(discordToken);
