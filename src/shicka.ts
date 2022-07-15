import type {
	ApplicationCommandData,
	AutocompleteInteraction,
	CommandInteraction,
	Guild,
	GuildMember,
	Interaction,
	Message,
	PartialGuildMember,
	ThreadChannel,
} from "discord.js";
import type {Job} from "node-schedule";
import type Command from "./commands.js";
import type Feed from "./feeds.js";
import type Trigger from "./triggers.js";
import type Greeting from "./greetings.js";
import {Client, Intents, Util} from "discord.js";
import * as commands from "./commands.js";
import * as feeds from "./feeds.js";
import * as triggers from "./triggers.js";
import * as greetings from "./greetings.js";
const {
	SHICKA_DISCORD_TOKEN: discordToken = "",
}: NodeJS.ProcessEnv = process.env;
const capture: RegExp = /^.*$/su;
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
	for (const triggerName in triggers) {
		try {
			const trigger: Trigger = triggers[triggerName as keyof typeof triggers] as Trigger;
			await trigger.execute(message);
		} catch (error: unknown) {
			console.error(error);
		}
	}
});
client.on("threadCreate", async (channel: ThreadChannel, newlyCreated: boolean): Promise<void> => {
	if (newlyCreated && channel.joinable) {
		try {
			await channel.join();
		} catch (error: unknown) {
			console.error(error);
		}
		return;
	}
});
client.on("threadUpdate", async (oldChannel: ThreadChannel, newChannel: ThreadChannel): Promise<void> => {
	if (oldChannel.archived && !newChannel.archived && newChannel.joinable) {
		try {
			await newChannel.join();
		} catch (error: unknown) {
			console.error(error);
		}
		return;
	}
	if (!oldChannel.archived && newChannel.archived && newChannel.joined) {
		try {
			await newChannel.leave();
		} catch (error: unknown) {
			console.error(error);
		}
		return;
	}
});
await client.login(discordToken);
