import type {
	ApplicationCommandDataResolvable,
	AutoModerationActionMetadataOptions,
	AutoModerationActionOptions,
	AutoModerationRuleCreateOptions,
	ClientApplication,
	ClientEvents,
	Collection,
	ForumChannel,
	Guild,
	GuildBasedChannel,
	Interaction,
	MediaChannel,
	NewsChannel,
	Role,
	StageChannel,
	TextChannel,
	ThreadChannel,
	VoiceChannel,
	WebhookCreateOptions,
} from "discord.js";
import type {Job} from "node-schedule";
import type Command from "./commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "./commands.js";
import type Hook from "./hooks.js";
import type {Webhook, WebhookData, WebjobInvocation} from "./hooks.js";
import type Rule from "./rules.js";
import type {AutoModerationActionExecution, AutoModerationRule, AutoModerationRuleData} from "./rules.js";
import {
	ActivityType,
	ApplicationCommandType,
	ChannelType,
	Client,
	GatewayIntentBits,
} from "discord.js";
import schedule from "node-schedule";
import * as commands from "./commands.js";
import * as hooks from "./hooks.js";
import * as rules from "./rules.js";
type ApplicationCommandCreateOptionsResolvable = ApplicationCommandData;
type GlobalApplicationCommandCreateOptionsResolvable = ApplicationCommandCreateOptionsResolvable & {global: true};
type GuildApplicationCommandCreateOptionsResolvable = ApplicationCommandCreateOptionsResolvable & {global?: false};
type WebhookCreateOptionsResolvable = WebhookData["hookOptions"];
type WebjobEvent = WebjobInvocation["event"];
type AutoModerationRuleCreateOptionsResolvable = AutoModerationRuleData;
const {
	SHICKA_DISCORD_TOKEN,
}: NodeJS.ProcessEnv = process.env;
const discordToken: string = SHICKA_DISCORD_TOKEN ?? "";
async function submitCommands(applicationOrGuild: ClientApplication | Guild, globalOrGuildCommandRegistry: ApplicationCommandCreateOptionsResolvable[]): Promise<boolean> {
	const commandRegistry: ApplicationCommandDataResolvable[] = globalOrGuildCommandRegistry.map<ApplicationCommandDataResolvable>((commandOptionsResolvable: ApplicationCommandCreateOptionsResolvable): ApplicationCommandDataResolvable => {
		const {
			global,
			...commandOptions
		}: ApplicationCommandCreateOptionsResolvable = commandOptionsResolvable;
		return commandOptions;
	})
	try {
		await applicationOrGuild.commands.set(commandRegistry);
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
	const {client}: Guild = guild;
	const {user}: Client<true> = client;
	const ownGuildWebhooks: {[k in string]: Webhook[]} = Object.create(null);
	for (const webhook of guildWebhooks.values()) {
		const {owner}: Webhook = webhook;
		if (owner == null || owner.id !== user.id) {
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
		const channel: TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | MediaChannel | null = ((): TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | MediaChannel | null => {
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
	const {client}: Guild = guild;
	const {user}: Client<true> = client;
	const ownGuildAutoModerationRules: {[k in string]: AutoModerationRule[]} = Object.create(null);
	for (const autoModerationRule of guildAutoModerationRules.values()) {
		if (autoModerationRule.creatorId !== user.id) {
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
		const exemptChannels: (TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | MediaChannel)[] | null = exemptChannelsResolvable != null ? exemptChannelsResolvable.map<TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | MediaChannel | null>((exemptChannelResolvable: string): TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | MediaChannel | null => {
			const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
				return channel.name === exemptChannelResolvable;
			});
			if (channel == null || channel.type === ChannelType.GuildCategory || channel.isThread()) {
				return null;
			}
			return channel;
		}).filter<TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | MediaChannel>((exemptChannel: TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | MediaChannel | null): exemptChannel is TextChannel | NewsChannel | VoiceChannel | StageChannel | ForumChannel | MediaChannel => {
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
client.once("ready", async (client: Client<true>): Promise<void> => {
	const commandRegistry: ApplicationCommandData[] = Object.getOwnPropertyNames(commands).map<ApplicationCommandData>((commandName: string): ApplicationCommandData => {
		const command: Command = commands[commandName as keyof typeof commands];
		return command.register();
	});
	const globalCommandRegistry: GlobalApplicationCommandCreateOptionsResolvable[] = commandRegistry.filter<GlobalApplicationCommandCreateOptionsResolvable>((commandData: ApplicationCommandData): commandData is GlobalApplicationCommandCreateOptionsResolvable => {
		return commandData.global ?? false;
	});
	try {
		const submitted: boolean = await submitCommands(client.application, globalCommandRegistry);
		if (submitted == false) {
			throw new Error();
		}
	} catch (error: unknown) {
		console.error(error);
	}
	const guildCommandRegistry: GuildApplicationCommandCreateOptionsResolvable[] = commandRegistry.filter<GuildApplicationCommandCreateOptionsResolvable>((commandData: ApplicationCommandData): commandData is GuildApplicationCommandCreateOptionsResolvable => {
		return !(commandData.global ?? false);
	});
	for (const guild of client.guilds.cache.values()) {
		try {
			const submitted: boolean = await submitCommands(guild, guildCommandRegistry);
			if (submitted == false) {
				throw new Error();
			}
		} catch (error: unknown) {
			console.error(error);
		}
	}
	const hookRegistry: WebhookCreateOptionsResolvable[] = Object.getOwnPropertyNames(hooks).map<WebhookData>((hookName: string): WebhookData => {
		const hook: Hook = hooks[hookName as keyof typeof hooks];
		return hook.register();
	}).map<WebhookCreateOptionsResolvable>((webhookData: WebhookData): WebhookCreateOptionsResolvable => {
		const {hookOptions}: WebhookData = webhookData;
		const hookName: string = hookOptions.name;
		if (webhookData.type !== "cronWebjobInvocation") {
			const {type}: WebhookData & {type: keyof ClientEvents} = webhookData;
			const job: {name: string} = {
				name: hookName,
			};
			client.on(type, async (...data: ClientEvents[keyof ClientEvents]): Promise<void> => {
				let guild: Guild | null = null;
				for (let k: number = data.length - 1; k >= 0; --k) {
					const datum: ClientEvents[keyof ClientEvents][number] = data[k];
					if (typeof datum === "boolean" || typeof datum === "number" || typeof datum === "string" || datum == null) {
						continue;
					}
					if ("systemChannel" in datum) {
						guild = datum;
						break;
					}
					if (!("guild" in datum) || datum.guild == null) {
						continue;
					}
					if ("systemChannel" in datum.guild) {
						guild = datum.guild;
						break;
					}
				}
				if (guild == null) {
					return;
				}
				const webhooks: Webhook[] = [];
				const guildWebhooks: Collection<string, Webhook> | undefined = await (async (): Promise<Collection<string, Webhook> | undefined> => {
					try {
						return await guild.fetchWebhooks();
					} catch {}
				})();
				if (guildWebhooks == null) {
					return;
				}
				for (const webhook of guildWebhooks.values()) {
					if (webhook.name !== hookName) {
						continue;
					}
					webhooks.push(webhook);
				}
				const event: WebjobEvent = {
					type,
					data,
				};
				const invocation: WebjobInvocation = {
					job,
					event,
					client,
					webhooks,
				};
				client.emit("webjobInvocation", invocation);
			});
		} else {
			const {type, jobOptions}: WebhookData & {type: "cronWebjobInvocation"} = webhookData;
			const job: Job = schedule.scheduleJob(hookName, jobOptions, async (...data: [timestamp: Date]): Promise<void> => {
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
				const event: WebjobEvent = {
					type,
					data,
				};
				const invocation: WebjobInvocation = {
					job,
					event,
					client,
					webhooks,
				};
				client.emit("webjobInvocation", invocation);
			});
		}
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
	const ruleRegistry: AutoModerationRuleCreateOptionsResolvable[] = Object.getOwnPropertyNames(rules).map<AutoModerationRuleCreateOptionsResolvable>((ruleName: string): AutoModerationRuleCreateOptionsResolvable => {
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
	if (!autoModerationRule.enabled) {
		return;
	}
	const {client}: AutoModerationRule = autoModerationRule;
	const {user}: Client<true> = client;
	if (autoModerationRule.creatorId !== user.id) {
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
client.on("interactionCreate", async (interaction: Interaction): Promise<void> => {
	if (!interaction.inCachedGuild()) {
		return;
	}
	if (!interaction.isAutocomplete() && !interaction.isChatInputCommand() &&!interaction.isMessageContextMenuCommand()) {
		return;
	}
	const {command}: ApplicationUserInteraction = interaction;
	if (command == null) {
		return;
	}
	if (command.type !== ApplicationCommandType.ChatInput && command.type !== ApplicationCommandType.Message) {
		return;
	}
	const {client}: ApplicationCommand = command;
	const {user}: Client<true> = client;
	if (command.applicationId !== user.id) {
		return;
	}
	const commandName: string = command.name;
	if (!(commandName in commands)) {
		return;
	}
	try {
		const command: Command = commands[commandName as keyof typeof commands];
		await command.interact(interaction);
	} catch (error: unknown) {
		console.error(error);
	}
});
client.on("threadCreate", async (channel: ThreadChannel<boolean>, newlyCreated: boolean): Promise<void> => {
	if (newlyCreated && channel.joinable) {
		try {
			await channel.join();
		} catch (error: unknown) {
			console.error(error);
		}
		return;
	}
});
client.on("threadUpdate", async (oldChannel: ThreadChannel<boolean>, newChannel: ThreadChannel<boolean>): Promise<void> => {
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
client.on("webjobInvocation", async (invocation: WebjobInvocation): Promise<void> => {
	const {job, client, webhooks}: WebjobInvocation = invocation;
	const {user}: Client<true> = client;
	const ownWebhooks: Webhook[] = [];
	for (const webhook of webhooks) {
		if (!webhook.isIncoming()) {
			continue;
		}
		const {owner}: Webhook = webhook;
		if (owner == null || owner.id !== user.id) {
			continue;
		}
		ownWebhooks.push(webhook);
	}
	if (ownWebhooks.length === 0) {
		return;
	}
	const hookName: string = job.name;
	if (!(hookName in hooks)) {
		return;
	}
	try {
		const hook: Hook = hooks[hookName as keyof typeof hooks];
		await hook.invoke({
			...invocation,
			webhooks: ownWebhooks,
		});
	} catch (error: unknown) {
		console.error(error);
	}
});
await client.login(discordToken);
