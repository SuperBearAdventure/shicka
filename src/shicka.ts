import type {
	ApplicationCommandData,
	AutoModerationActionExecution,
	AutoModerationActionMetadataOptions,
	AutoModerationActionOptions,
	AutoModerationRule,
	AutoModerationRuleCreateOptions,
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
	Role,
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
import type Rule from "./rules.js";
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
import * as rules from "./rules.js";
import * as greetings from "./greetings.js";
type WebhookCreateOptionsResolvable = Omit<WebhookCreateOptions, "channel"> & {channel: string};
type AutoModerationRuleCreateOptionsResolvable = Omit<AutoModerationRuleCreateOptions, "exemptChannels" | "exemptRoles" | "actions"> & {exemptChannels?: string[], exemptRoles?: string[], actions: (Omit<AutoModerationActionOptions, "metadata"> & {metadata?: Omit<AutoModerationActionMetadataOptions, "channel"> & {channel?: string}})[]};
const {
	SHICKA_DISCORD_TOKEN,
	SHICKA_BYE_OVERRIDE_SYSTEM_CHANNEL,
	SHICKA_HEY_OVERRIDE_SYSTEM_CHANNEL,
}: NodeJS.ProcessEnv = process.env;
const discordToken: string = SHICKA_DISCORD_TOKEN ?? "";
const byeSystemChannel: string | null = SHICKA_BYE_OVERRIDE_SYSTEM_CHANNEL ?? null;
const heySystemChannel: string | null = SHICKA_HEY_OVERRIDE_SYSTEM_CHANNEL ?? null;
const capture: RegExp = /^.*$/su;
const cardinalFormat: Intl.NumberFormat = new Intl.NumberFormat("en-US");
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
async function submitGuildRules(guild: Guild, ruleRegistry: AutoModerationRuleCreateOptionsResolvable[]): Promise<boolean> {
	const guildAutoModerationRules: Collection<string, AutoModerationRule> | undefined = await (async (): Promise<Collection<string, AutoModerationRule> | undefined> => {
		try {
			return await guild.autoModerationRules.fetch();
		} catch (error: unknown) {
			console.warn(error);
		}
	})();
	if (guildAutoModerationRules == null) {
		return false;
	}
	const ownGuildAutoModerationRules: {[k in string]: AutoModerationRule[]} = Object.create(null);
	for (const autoModerationRule of guildAutoModerationRules.values()) {
		const {user}: Client<boolean> = autoModerationRule.client;
		if (user == null || autoModerationRule.creatorId !== user.id) {
			continue;
		}
		(ownGuildAutoModerationRules[autoModerationRule.name] ??= []).push(autoModerationRule);
	}
	for (const [ruleName, autoModerationRules] of Object.entries(ownGuildAutoModerationRules)) {
		if (ruleName in rules && autoModerationRules.length === 1) {
			continue;
		}
		for (const autoModerationRule of autoModerationRules) {
			try {
				await autoModerationRule.delete();
			} catch (error: unknown) {
				console.warn(error);
				return false;
			}
		}
		delete ownGuildAutoModerationRules[ruleName];
	}
	for (const ruleOptionsResolvable of ruleRegistry) {
		const ruleName: string = ruleOptionsResolvable.name;
		if (ruleName in ownGuildAutoModerationRules) {
			continue;
		}
		const {
			exemptChannels: exemptChannelsResolvable,
			exemptRoles: exemptRolesResolvable,
			actions: actionsResolvable,
			...otherRuleOptions
		}: AutoModerationRuleCreateOptionsResolvable = ruleOptionsResolvable;
		const exemptChannels: (TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel)[] | null = exemptChannelsResolvable != null ? exemptChannelsResolvable.map<TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | null>((exemptChannelResolvable: string): TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | null => {
			const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
				return channel.name === exemptChannelResolvable;
			});
			if (channel == null || channel.type === ChannelType.GuildCategory || channel.isThread()) {
				return null;
			}
			return channel;
		}).filter<TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel>((exemptChannel: TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | null): exemptChannel is TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel => {
			return exemptChannel != null;
		}) : null;
		const exemptRoles: Role[] | null = exemptRolesResolvable != null ? exemptRolesResolvable.map<Role | null>((exemptRoleResolvable: string): Role | null => {
			const role: Role | undefined = guild.roles.cache.find((role: Role): boolean => {
				return role.name === exemptRoleResolvable;
			});
			if (role == null) {
				return null;
			}
			return role;
		}).filter<Role>((exemptRole: Role | null): exemptRole is Role => {
			return exemptRole != null;
		}) : null;
		const actions: AutoModerationActionOptions[] = actionsResolvable.map<AutoModerationActionOptions | null>((actionResolvable: Omit<AutoModerationActionOptions, "metadata"> & {metadata?: Omit<AutoModerationActionMetadataOptions, "channel"> & {channel?: string}}): AutoModerationActionOptions | null => {
			const {
				metadata: metadataResolvable,
				...otherActionOptions
			}: Omit<AutoModerationActionOptions, "metadata"> & {metadata?: Omit<AutoModerationActionMetadataOptions, "channel"> & {channel?: string}} = actionResolvable;
			const metadata: AutoModerationActionMetadataOptions | null = metadataResolvable != null ? ((): AutoModerationActionMetadataOptions | null => {
				const {
					channel: channelResolvable,
					...otherMetadataOptions
				}: Omit<AutoModerationActionMetadataOptions, "channel"> & {channel?: string} = metadataResolvable;
				const channel: TextChannel | NewsChannel | null = channelResolvable != null ? ((): TextChannel | NewsChannel | null => {
					const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
						return channel.name === channelResolvable;
					});
					if (channel == null || channel.isThread() || channel.isVoiceBased() || !channel.isTextBased()) {
						return null;
					}
					return channel;
				})() : null;
				if (channelResolvable != null && channel == null) {
					return null;
				}
				const metadata: AutoModerationActionMetadataOptions = {
					...(channel != null ? {channel} : {}),
					...otherMetadataOptions
				};
				return metadata;
			})() : null;
			if (metadataResolvable != null && metadata == null) {
				return null;
			}
			const action: AutoModerationActionOptions = {
				...(metadata != null ? {metadata} : {}),
				...otherActionOptions,
			};
			return action;
		}).filter<AutoModerationActionOptions>((action: AutoModerationActionOptions | null): action is AutoModerationActionOptions => {
			return action != null;
		});
		if (actionsResolvable.length !== 0 && actions.length === 0) {
			continue;
		}
		const ruleOptions: AutoModerationRuleCreateOptions = {
			...(exemptChannels != null ? {exemptChannels} : {}),
			...(exemptRoles != null ? {exemptRoles} : {}),
			actions,
			...otherRuleOptions,
		};
		try {
			await guild.autoModerationRules.create(ruleOptions);
		} catch (error: unknown) {
			console.warn(error);
			return false;
		}
	}
	return true;
}
const client: Client<boolean> = new Client({
	intents: [
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
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
		const command: Command = commands[commandName as keyof typeof commands];
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
		const hook: Hook = hooks[hookName as keyof typeof hooks];
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
	const ruleRegistry: AutoModerationRuleCreateOptionsResolvable[] = Object.keys(rules).map<AutoModerationRuleCreateOptionsResolvable>((ruleName: string): AutoModerationRuleCreateOptionsResolvable => {
		const rule: Rule = rules[ruleName as keyof typeof rules];
		return rule.register();
	});
	for (const guild of client.guilds.cache.values()) {
		try {
			const submitted: boolean = await submitGuildRules(guild, ruleRegistry);
			if (submitted == false) {
				throw new Error();
			}
		} catch (error: unknown) {
			console.error(error);
		}
	}
	console.log("Ready!");
});
client.on("autoModerationActionExecution", async (execution: AutoModerationActionExecution): Promise<void> => {
	const {autoModerationRule}: AutoModerationActionExecution = execution;
	if (autoModerationRule == null) {
		return;
	}
	const {user}: Client<boolean> = autoModerationRule.client;
	if (user == null || autoModerationRule.creatorId !== user.id) {
		return;
	}
	const ruleName: string = autoModerationRule.name;
	if (!(ruleName in rules)) {
		return;
	}
	try {
		const rule: Rule = rules[ruleName as keyof typeof rules];
		await rule.execute(execution);
	} catch (error: unknown) {
		console.error(error);
	}
});
client.on("guildMemberAdd", async (member: GuildMember): Promise<void> => {
	const {guild}: GuildMember = member;
	const {memberCount, systemChannel}: Guild = guild;
	const welcomeChannel: TextChannel | null = heySystemChannel != null ? ((): TextChannel | null => {
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === heySystemChannel;
		});
		if (channel == null || channel.type !== ChannelType.GuildText) {
			return null;
		}
		return channel;
	})() : systemChannel;
	if (welcomeChannel == null) {
		return;
	}
	const name: string = `<@${member.id}>`;
	const {hey}: {[k in string]: Greeting} = greetings;
	const greeting: string = name.replace(capture, hey[Math.random() * hey.length | 0]);
	const counting: string = memberCount % 10 !== 0 ? "" : `\nWe are now ${escapeMarkdown(cardinalFormat.format(memberCount))} members!`;
	try {
		const message: Message<true> = await welcomeChannel.send({
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
	const {guild}: GuildMember | PartialGuildMember = member;
	const {systemChannel}: Guild = guild;
	const farewellChannel: TextChannel | null = byeSystemChannel != null ? ((): TextChannel | null => {
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === byeSystemChannel;
		});
		if (channel == null || channel.type !== ChannelType.GuildText) {
			return null;
		}
		return channel;
	})() : systemChannel;
	if (farewellChannel == null) {
		return;
	}
	const name: string = `**${escapeMarkdown(member.user.username)}**${member.user.discriminator != null && member.user.discriminator !== "0" ? `#**${escapeMarkdown(member.user.discriminator)}**` : ""}${member.user.globalName != null ? ` (**${escapeMarkdown(member.user.globalName)}**)` : ""}`;
	const {bye}: {[k in string]: Greeting} = greetings;
	const greeting: string = name.replace(capture, bye[Math.random() * bye.length | 0]);
	try {
		const message: Message<true> = await farewellChannel.send({
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
		const command: Command = commands[commandName as keyof typeof commands];
		await command.execute(interaction);
	} catch (error: unknown) {
		console.error(error);
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
		const hook: Hook = hooks[hookName as keyof typeof hooks];
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
