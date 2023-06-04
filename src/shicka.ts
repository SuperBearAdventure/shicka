import type {
	ApplicationCommandData,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	Collection,
	ForumChannel,
	Guild,
	GuildBasedChannel,
	GuildMember,
	Interaction,
	Message,
	NewsChannel,
	PartialGuildMember,
	StageChannel,
	TextChannel,
	ThreadChannel,
	VoiceChannel,
	Webhook,
	WebhookCreateOptions,
} from "discord.js";
import type {Job, RecurrenceSpecDateRange} from "node-schedule";
import type Command from "./commands.js";
import type Hook from "./hooks.js";
import type Trigger from "./triggers.js";
import type Greeting from "./greetings.js";
import {
	ActivityType,
	ChannelType,
	Client,
	GatewayIntentBits,
	escapeMarkdown,
} from "discord.js";
import schedule from "node-schedule";
import * as commands from "./commands.js";
import * as hooks from "./hooks.js";
import * as triggers from "./triggers.js";
import * as greetings from "./greetings.js";
type WebhookCreateOptionsResolvable = Omit<WebhookCreateOptions, "channel"> & {channel: string};
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
async function submitGuildHooks(guild: Guild, hookRegistry: WebhookCreateOptionsResolvable[]): Promise<boolean> {
	const guildWebhooks: Collection<string, Webhook> | undefined = await (async (): Promise<Collection<string, Webhook> | undefined> => {
		try {
			return await guild.fetchWebhooks();
		} catch (error: unknown) {
			console.warn(error);
		}
	})();
	if (guildWebhooks == null) {
		return false;
	}
	const ownGuildWebhooks: {[k in string]: Webhook[]} = Object.create(null);
	for (const webhook of guildWebhooks.values()) {
		if (!webhook.isIncoming()) {
			continue;
		}
		const {owner}: Webhook = webhook;
		const {user}: Client<boolean> = webhook.client;
		if (owner == null || user == null || owner.id !== user.id) {
			continue;
		}
		(ownGuildWebhooks[webhook.name] ??= []).push(webhook);
	}
	for (const [hookName, webhooks] of Object.entries(ownGuildWebhooks)) {
		if (hookName in hooks && webhooks.length === 1) {
			continue;
		}
		for (const webhook of webhooks) {
			try {
				await webhook.delete();
			} catch (error: unknown) {
				console.warn(error);
				return false;
			}
		}
		delete ownGuildWebhooks[hookName];
	}
	for (const hookOptionsResolvable of hookRegistry) {
		const hookName: string = hookOptionsResolvable.name;
		if (hookName in ownGuildWebhooks) {
			continue;
		}
		const {
			channel: channelResolvable,
			...otherHookOptions
		}: WebhookCreateOptionsResolvable = hookOptionsResolvable;
		const channel: TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | null = ((): TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | null => {
			const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
				return channel.name === channelResolvable;
			});
			if (channel == null || channel.type === ChannelType.GuildCategory || channel.isThread()) {
				return null;
			}
			return channel;
		})();
		if (channel == null) {
			continue;
		}
		const hookOptions: WebhookCreateOptions = {
			channel,
			...otherHookOptions,
		};
		try {
			await guild.channels.createWebhook(hookOptions);
		} catch (error: unknown) {
			console.warn(error);
			return false;
		}
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
	const hookRegistry: WebhookCreateOptionsResolvable[] = Object.keys(hooks).map<{hookOptions: WebhookCreateOptionsResolvable, jobOptions: RecurrenceSpecDateRange}>((hookName: string): {hookOptions: WebhookCreateOptionsResolvable, jobOptions: RecurrenceSpecDateRange} => {
		const hook: Hook = hooks[hookName as keyof typeof hooks] as Hook;
		return hook.register();
	}).map<WebhookCreateOptionsResolvable>(({hookOptions, jobOptions}: {hookOptions: WebhookCreateOptionsResolvable, jobOptions: RecurrenceSpecDateRange}): WebhookCreateOptionsResolvable => {
		const hookName: string = hookOptions.name;
		const job: Job = schedule.scheduleJob(hookName, jobOptions, async (timestamp: Date): Promise<void> => {
			const webhooks: Webhook[] = [];
			for (const guild of client.guilds.cache.values()) {
				const guildWebhooks: Collection<string, Webhook> | undefined = await (async (): Promise<Collection<string, Webhook> | undefined> => {
					try {
						return await guild.fetchWebhooks();
					} catch {}
				})();
				if (guildWebhooks == null) {
					continue;
				}
				for (const webhook of guildWebhooks.values()) {
					if (webhook.name !== hookName) {
						continue;
					}
					webhooks.push(webhook);
				}
			}
			const webhookJobInvocation: {job: Job, timestamp: Date, webhooks: Webhook[]} = {
				job,
				timestamp,
				webhooks,
			};
			client.emit("webhookJobInvocation", webhookJobInvocation);
		});
		return hookOptions;
	});
	for (const guild of client.guilds.cache.values()) {
		try {
			const submitted: boolean = await submitGuildHooks(guild, hookRegistry);
			if (submitted == false) {
				throw new Error();
			}
		} catch (error: unknown) {
			console.error(error);
		}
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
client.on("webhookJobInvocation", async (invocation: {job: Job, timestamp: Date, webhooks: Webhook[]}): Promise<void> => {
	const {job, timestamp, webhooks}: {job: Job, timestamp: Date, webhooks: Webhook[]} = invocation;
	const ownWebhooks: Webhook[] = [];
	for (const webhook of webhooks) {
		if (!webhook.isIncoming()) {
			continue;
		}
		const {owner}: Webhook = webhook;
		const {user}: Client<boolean> = webhook.client;
		if (owner == null || user == null || owner.id !== user.id) {
			continue;
		}
		ownWebhooks.push(webhook);
	}
	if (webhooks.length === 0) {
		return;
	}
	const hookName: string = job.name;
	if (!(hookName in hooks)) {
		return;
	}
	try {
		const hook: Hook = hooks[hookName as keyof typeof hooks] as Hook;
		await hook.execute({
			job,
			timestamp,
			webhooks: ownWebhooks,
		});
	} catch (error: unknown) {
		console.error(error);
	}
});
await client.login(discordToken);
