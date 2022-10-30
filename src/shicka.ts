import type {
	ApplicationCommandData,
	AutocompleteInteraction,
	CommandInteraction,
	Guild,
	GuildMember,
	Interaction,
	Message,
	PartialGuildMember,
} from "discord.js";
import type {Job} from "node-schedule";
import type Command from "./commands.js";
import type Feed from "./feeds.js";
import type Grant from "./grants.js";
import type Trigger from "./triggers.js";
import type Greeting from "./greetings.js";
import {Client, Intents, Util} from "discord.js";
import * as commands from "./commands.js";
import * as feeds from "./feeds.js";
import * as grants from "./grants.js";
import * as triggers from "./triggers.js";
import * as greetings from "./greetings.js";
const {
	SHICKA_DISCORD_TOKEN: discordToken = "",
}: NodeJS.ProcessEnv = process.env;
const capture: RegExp = /^.*$/su;
const parameter: RegExp = /([^\n ]+)/u;
const client: Client = new Client({
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
client.once("ready", async (client: Client): Promise<void> => {
	const menu: ApplicationCommandData[] = Object.keys(commands).map<ApplicationCommandData>((commandName: string): ApplicationCommandData => {
		const command: Command = commands[commandName as keyof typeof commands] as Command;
		return command.register();
	});
	for (const guild of client.guilds.cache.values()) {
		await guild.commands.set(menu);
	}
	for (const feedName of Object.keys(feeds)) {
		const feed: Feed = feeds[feedName as keyof typeof feeds] as Feed;
		const job: Job = feed.register(client);
		job.on("error", (error: unknown): void => {
			console.error(error);
		});
	}
	console.log("Ready!");
});
client.on("guildMemberAdd", async (member: GuildMember): Promise<void> => {
	const {memberCount, systemChannel}: Guild = member.guild;
	if (systemChannel == null) {
		return;
	}
	const name: string = `${member}`;
	const {hey}: {[k in string]: Greeting} = greetings;
	const greeting: string = name.replace(capture, hey[Math.random() * hey.length | 0]);
	const counting: string = memberCount % 10 !== 0 ? "" : `\nWe are now ${Util.escapeMarkdown(`${memberCount}`)} members!`;
	try {
		const message: Message = await systemChannel.send({
			content: `${greeting}${counting}`,
		});
		await message.react("🇭");
		await message.react("🇪");
		await message.react("🇾");
		await message.react("👋");
	} catch (error: unknown) {
		console.error(error);
	}
});
client.on("guildMemberRemove", async (member: GuildMember | PartialGuildMember): Promise<void> => {
	const {systemChannel}: Guild = member.guild;
	if (systemChannel == null) {
		return;
	}
	const name: string = `**${Util.escapeMarkdown(member.user.username)}**`;
	const {bye}: {[k in string]: Greeting} = greetings;
	const greeting: string = name.replace(capture, bye[Math.random() * bye.length | 0]);
	try {
		const message: Message = await systemChannel.send({
			content: greeting,
		});
		await message.react("🇧");
		await message.react("🇾");
		await message.react("🇪");
		await message.react("👋");
	} catch (error: unknown) {
		console.error(error);
	}
});
client.on("interactionCreate", async (interaction: Interaction): Promise<void> => {
	if (interaction.user.bot) {
		return;
	}
	const {channel}: Interaction = interaction;
	if (channel == null || !("name" in channel)) {
		return;
	}
	if (!interaction.isAutocomplete() && !interaction.isCommand()) {
		return;
	}
	const {commandName}: AutocompleteInteraction | CommandInteraction = interaction;
	if (!(commandName in commands)) {
		return;
	}
	try {
		const command: Command = commands[commandName as keyof typeof commands] as Command;
		await command.execute(interaction);
	} catch (error: unknown) {
		console.error(error);
	}
});
client.on("messageCreate", async (message: Message): Promise<void> => {
	if (message.author.bot) {
		return;
	}
	const {channel}: Message = message;
	if (!("name" in channel)) {
		return;
	}
	const {content}: Message = message;
	if (!content.startsWith("/")) {
		return;
	}
	const tokens: string[] = content.split(parameter);
	const parameters: string[] = tokens.filter((token: string, index: number): boolean => {
		return index % 2 === 1;
	});
	const grantName: string = parameters[0].slice(1);
	if (!(grantName in grants)) {
		return;
	}
	try {
		const grant: Grant = grants[grantName as keyof typeof grants] as Grant;
		await grant.execute(message, parameters, tokens);
	} catch (error: unknown) {
		console.error(error);
	}
});
client.on("messageCreate", async (message: Message): Promise<void> => {
	if (message.author.bot) {
		return;
	}
	const {channel}: Message = message;
	if (!("name" in channel)) {
		return;
	}
	for (const triggerName in triggers) {
		try {
			const trigger: Trigger = triggers[triggerName as keyof typeof triggers] as Trigger;
			await trigger.execute(message);
		} catch (error: unknown) {
			console.error(error);
		}
	}
});
await client.login(discordToken);
