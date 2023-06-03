import type {
	ApplicationCommandData,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
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
import {
	ActivityType,
	Client,
	GatewayIntentBits,
	escapeMarkdown,
} from "discord.js";
import * as commands from "./commands.js";
import * as feeds from "./feeds.js";
import * as triggers from "./triggers.js";
import * as greetings from "./greetings.js";
const {
	SHICKA_DISCORD_TOKEN: discordToken = "",
}: NodeJS.ProcessEnv = process.env;
const capture: RegExp = /^.*$/su;
async function submitGuildCommands(guild: Guild, commandRegistry: ApplicationCommandData[]): Promise<boolean> {
	try {
		await guild.commands.set(commandRegistry);
	} catch (error: unknown) {
		console.warn(error);
		return false;
	}
	return true;
}
const client: Client<boolean> = new Client({
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
	],
	presence: {
		activities: [
			{
				name: `/help - Super Bear Adventure`,
				type: ActivityType.Playing,
			},
		],
		status: "online",
	},
});
client.once("ready", async (client: Client<boolean>): Promise<void> => {
	const commandRegistry: ApplicationCommandData[] = Object.keys(commands).map<ApplicationCommandData>((commandName: string): ApplicationCommandData => {
		const command: Command = commands[commandName as keyof typeof commands] as Command;
		return command.register();
	});
	for (const guild of client.guilds.cache.values()) {
		try {
			const submitted: boolean = await submitGuildCommands(guild, commandRegistry);
			if (submitted == false) {
				throw new Error();
			}
		} catch (error: unknown) {
			console.error(error);
		}
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
	const counting: string = memberCount % 10 !== 0 ? "" : `\nWe are now ${escapeMarkdown(`${memberCount}`)} members!`;
	try {
		const message: Message<true> = await systemChannel.send({
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
	const name: string = `**${escapeMarkdown(member.user.username)}**`;
	const {bye}: {[k in string]: Greeting} = greetings;
	const greeting: string = name.replace(capture, bye[Math.random() * bye.length | 0]);
	try {
		const message: Message<true> = await systemChannel.send({
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
	if (!interaction.inCachedGuild()) {
		return;
	}
	if (!interaction.isAutocomplete() && !interaction.isChatInputCommand()) {
		return;
	}
	const {commandName}: AutocompleteInteraction<"cached"> | ChatInputCommandInteraction<"cached"> = interaction;
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
	if (!message.inGuild()) {
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
