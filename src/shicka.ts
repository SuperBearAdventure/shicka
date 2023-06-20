import type {IncomingMessage, Server, ServerResponse} from "node:http";
import type {
	ApplicationRoleConnectionMetadataEditOptions,
	AutoModerationActionMetadataOptions,
	AutoModerationActionOptions,
	AutoModerationRuleCreateOptions,
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
import type {Response} from "node-fetch";
import type {Job} from "node-schedule";
import type Command from "./commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "./commands.js";
import type Hook from "./hooks.js";
import type {Webhook, WebhookData, WebjobInvocation} from "./hooks.js";
import type Rule from "./rules.js";
import type {AutoModerationActionExecution, AutoModerationRule, AutoModerationRuleData} from "./rules.js";
import crypto from "node:crypto";
import http from "node:http";
import cookie from "cookie";
import {
	ActivityType,
	ApplicationCommandType,
	ApplicationRoleConnectionMetadataType,
	ChannelType,
	Client,
	GatewayIntentBits,
} from "discord.js";
import fetch from "node-fetch";
import schedule from "node-schedule";
import * as commands from "./commands.js";
import * as hooks from "./hooks.js";
import * as rules from "./rules.js";
type WebhookCreateOptionsResolvable = WebhookData["hookOptions"];
type WebjobEvent = WebjobInvocation["event"];
type AutoModerationRuleCreateOptionsResolvable = AutoModerationRuleData;
const {
	PORT,
	SHICKA_DISCORD_TOKEN,
	// SHICKA_GOOGLE_TOKEN,
	SHICKA_ORIGIN,
	SHICKA_VERIFICATION_PATHNAME,
	SHICKA_DISCORD_CLIENT_ID,
	SHICKA_DISCORD_CLIENT_SECRET,
	SHICKA_DISCORD_REDIRECT_PATHNAME,
	SHICKA_GOOGLE_CLIENT_ID,
	SHICKA_GOOGLE_CLIENT_SECRET,
	SHICKA_GOOGLE_REDIRECT_PATHNAME,
}: NodeJS.ProcessEnv = process.env;
const port: string = PORT ?? "8080";
const discordToken: string = SHICKA_DISCORD_TOKEN ?? "";
// const googleToken: string = SHICKA_GOOGLE_TOKEN ?? "";
const origin: string = SHICKA_ORIGIN ?? "http://127.0.0.1:8080";
const verificationPathname: string = SHICKA_VERIFICATION_PATHNAME ?? "/connections/";
const discordClientId: string = SHICKA_DISCORD_CLIENT_ID ?? "";
const discordClientSecret: string = SHICKA_DISCORD_CLIENT_SECRET ?? "";
const discordRedirectPathname: string = SHICKA_DISCORD_REDIRECT_PATHNAME ?? "/connections/discord/";
const googleClientId: string = SHICKA_GOOGLE_CLIENT_ID ?? "";
const googleClientSecret: string = SHICKA_GOOGLE_CLIENT_SECRET ?? "";
const googleRedirectPathname: string = SHICKA_GOOGLE_REDIRECT_PATHNAME ?? "/connections/google/";
async function submitConnections(client: Client<boolean>, connectionRegistry: ApplicationRoleConnectionMetadataEditOptions[]): Promise<boolean> {
	try {
		const {application}: Client = client;
		if (application == null) {
			return false;
		}
		await application.editRoleConnectionMetadataRecords(connectionRegistry);
	} catch (error: unknown) {
		console.warn(error);
		return false;
	}
	return true;
}
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
	const connectionRegistry: ApplicationRoleConnectionMetadataEditOptions[] = [
		{
			type: ApplicationRoleConnectionMetadataType.BooleanEqual,
			key: "backer_android",
			name: "Backer on Android",
			nameLocalizations: {
				"en-US": "Backer on Android",
				"fr": "Backer on Android",
				"pt-BR": "Backer on Android",
			},
			description: "Tells if the given member bought SBA Gold on Android",
			descriptionLocalizations: {
				"en-US": "Tells if the given member bought SBA Gold on Android",
				"fr": "Tells if the given member bought SBA Gold on Android",
				"pt-BR": "Tells if the given member bought SBA Gold on Android",
			},
		},
	];
	try {
		const submitted: boolean = await submitConnections(client, connectionRegistry);;
		if (submitted == false) {
			throw new Error();
		}
	} catch (error: unknown) {
		console.error(error);
	}
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
	const hookRegistry: WebhookCreateOptionsResolvable[] = Object.keys(hooks).map<WebhookData>((hookName: string): WebhookData => {
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
	console.log("Client ready!");
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
	if (command.guild == null) {
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
// function generateCodeVerifier(): string {
// 	return crypto.randomBytes(128).toString().replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "~");
// }
// function generateCodeChallenge(codeVerifier: string): string {
// 	return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
// }
function generateIdentifier(): string {
	return crypto.randomUUID();
}
const discordRedirectLink: string = new URL(discordRedirectPathname, origin).href;
const googleRedirectLink: string = new URL(googleRedirectPathname, origin).href;
const discordUsers: {[k in string]: string} = Object.create(null);
const googleUsers: {[k in string]: string} = Object.create(null);
const discordTokens: {[k in string]: string} = Object.create(null);
const googleTokens: {[k in string]: string} = Object.create(null);
const server: Server = http.createServer(async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
	const method: string | undefined = request.method;
	const path: string | undefined = request.url;
	let content: string | Buffer;
	let contentType: string;
	try {
		if (method == null) {
			throw new Error("No method");
		}
		if (path == null) {
			throw new Error("No URL");
		}
		const {pathname, searchParams}: URL = new URL(path, origin);
		switch (pathname) {
			case verificationPathname: {
				switch (method) {
					case "GET": {
						const discordContent: string = `		<form action="${discordRedirectPathname}" method="POST">
			<p><button type="submit">Authorize accessing Discord</button></p>
		</form>
`;
						const googleContent: string = `		<form action="${googleRedirectPathname}" method="POST">
			<p><button type="submit">Authorize accessing Google</button></p>
		</form>
`;
						const shickaContent: string = `		<form action="${verificationPathname}" method="POST">
			<p><button type="submit">Link accounts</button></p>
		</form>
`;
						content = `<!DOCTYPE html>
<html lang="fr">
	<head>
		<title>Shicka connections</title>
		<meta name="viewport" content="width=device-width" />
		<meta name="color-scheme" content="dark light" />
	</head>
	<body>
${discordContent}${googleContent}${shickaContent}	</body>
</html>
`;
						contentType = "text/html; charset=utf-8";
						response.statusCode = 200;
						break;
					}
					case "POST": {
						const originHeader: string | undefined = request.headers.origin;
						if (originHeader !== origin) {
							throw new Error();
						}
						const cookieHeader: string | undefined = request.headers.cookie;
						if (cookieHeader == null) {
							throw new Error();
						}
						const cookies: {[k in string]: string | undefined} = cookie.parse(cookieHeader); // IDEA: chain sessions
						const discordSession: string | undefined = cookies["shicka_discord_session"];
						if (discordSession == null) {
							throw new Error();
						}
						if (!(discordSession in discordUsers)) {
							throw new Error();
						}
						const discordUserId: string = discordUsers[discordSession];
						if (!(discordUserId in discordTokens)) {
							throw new Error();
						}
						const discordAccessToken: string = discordTokens[discordUserId];
						const googleSession: string | undefined = cookies["shicka_google_session"];
						if (googleSession == null) {
							throw new Error();
						}
						if (!(googleSession in googleUsers)) {
							throw new Error();
						}
						const googleUserId: string = googleUsers[googleSession];
						if (!(googleUserId in googleTokens)) {
							throw new Error();
						}
						const googleAccessToken: string = googleTokens[googleUserId];
						const productLink: string = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/com.Earthkwak.Platformer/purchases/products/com.earthkwak.platformer.donator/tokens/${googleAccessToken}`; // FIXME: use the product purchase token
						const productResponse: Response = await fetch(productLink);
						if (!productResponse.ok) {
							throw new Error(); // FIXME: set the `backer` boolean to `false`
						}
						const productData: any = await productResponse.json();
						const backer: boolean = productData.purchaseState === 0;
						const metadata: {[k in string]: any} = {
							"backer": backer,
						};
						const roleConnectionLink: string = `https://discord.com/api/v10/users/@me/applications/${discordClientId}/role-connection`;
						const roleConnectionResponse: Response = await fetch(roleConnectionLink, {
							body: JSON.stringify({
								"metadata": metadata,
							}),
							headers: {
								"authorization": `Bearer ${discordAccessToken}`,
								"content-type": "application/json",
							},
							method: "PUT",
						});
						if (!roleConnectionResponse.ok) {
							throw new Error();
						}
						// const roleConnectionData: any = await roleConnectionResponse.json();
						response.setHeader("location", verificationPathname);
						content = "302 Found";
						contentType = "text/plain; charset=utf-8";
						response.statusCode = 302;
						break;
					}
					default: {
						throw new Error();
					}
				}
				break;
			}
			case discordRedirectPathname: {
				switch (method) {
					case "GET": {
						const code: string | null = searchParams.get("code");
						if (code == null) {
							throw new Error();
						}
						const discordState: string | null = searchParams.get("state");
						if (discordState == null) {
							throw new Error();
						}
						const cookieHeader: string | undefined = request.headers.cookie;
						if (cookieHeader == null) {
							throw new Error();
						}
						const cookies: {[k in string]: string | undefined} = cookie.parse(cookieHeader);
						const clientState: string | undefined = cookies["shicka_discord_state"];
						if (clientState == null) {
							throw new Error();
						}
						if (clientState !== discordState) {
							throw new Error();
						}
						const tokenLink: string = "https://discord.com/api/v10/oauth2/token";
						const tokenSearchParams: URLSearchParams = new URLSearchParams({
							"client_id": discordClientId,
							"client_secret": discordClientSecret,
							"code": code,
							// "code_verifier": codeVerifier,
							"grant_type": "authorization_code",
							"redirect_uri": discordRedirectLink,
						});
						const tokenResponse: Response = await fetch(tokenLink, {
							body: tokenSearchParams,
							headers: {
								"content-type": "application/x-www-form-urlencoded",
							},
							method: "POST",
						});
						if (!tokenResponse.ok) {
							throw new Error();
						}
						const tokenData: any = await tokenResponse.json();
						const accessToken: string = tokenData.access_token;
						// const refreshToken: string = tokenData.refresh_token;
						// const expiresIn: string = tokenData.expires_in;
						const userLink: string = "https://discord.com/api/v10/oauth2/@me";
						const userResponse: Response = await fetch(userLink, {
							headers: {
								"authorization": `Bearer ${accessToken}`,
							},
						});
						if (!userResponse.ok) {
							throw new Error();
						}
						const userData: any = await userResponse.json();
						const userId: string = userData.user.id;
						const session: string = generateIdentifier();
						discordUsers[session] = userId;
						discordTokens[userId] = accessToken; // TODO: duration
						response.setHeader("location", verificationPathname);
						response.setHeader("set-cookie", [
							cookie.serialize("shicka_discord_state", "", {
								httpOnly: true,
								maxAge: 0,
								path: "/",
							}),
							cookie.serialize("shicka_discord_session", session, {
								httpOnly: true,
								path: "/",
							}),
						]); // TODO: duration
						content = "302 Found";
						contentType = "text/plain; charset=utf-8";
						response.statusCode = 302;
						break;
					}
					case "POST": {
						const originHeader: string | undefined = request.headers.origin;
						if (originHeader !== origin) {
							throw new Error();
						}
						const authorizationLink: string = "https://discord.com/api/oauth2/authorize";
						// const codeVerifier: string = generateCodeVerifier();
						// const codeChallenge: string = generateCodeChallenge(codeVerifier);
						const state: string = generateIdentifier();
						const authorizationSearchParams: URLSearchParams = new URLSearchParams({
							"client_id": discordClientId,
							// "code_challenge": codeChallenge,
							// "code_challenge_method": "S256",
							// "prompt": "consent",
							"scope": "identify role_connections.write",
							"state": state,
							"redirect_uri": discordRedirectLink,
							"response_type": "code",
						});
						response.setHeader("location", `${authorizationLink}?${authorizationSearchParams}`);
						response.setHeader("set-cookie", cookie.serialize("shicka_discord_state", state, {
							httpOnly: true,
							path: "/",
						})); // TODO: duration
						content = "302 Found";
						contentType = "text/plain; charset=utf-8";
						response.statusCode = 302;
						break;
					}
					default: {
						throw new Error();
					}
				}
				break;
			}
			case googleRedirectPathname: {
				switch (method) {
					case "GET": {
						const code: string | null = searchParams.get("code");
						if (code == null) {
							throw new Error();
						}
						const googleState: string | null = searchParams.get("state");
						if (googleState == null) {
							throw new Error();
						}
						const cookieHeader: string | undefined = request.headers.cookie;
						if (cookieHeader == null) {
							throw new Error();
						}
						const cookies: {[k in string]: string | undefined} = cookie.parse(cookieHeader);
						const clientState: string | undefined = cookies["shicka_google_state"];
						if (clientState == null) {
							throw new Error();
						}
						if (clientState !== googleState) {
							throw new Error();
						}
						const tokenLink: string = "https://oauth2.googleapis.com/token";
						const tokenSearchParams: URLSearchParams = new URLSearchParams({
							"client_id": googleClientId,
							"client_secret": googleClientSecret,
							"code": code,
							// "code_verifier": codeVerifier,
							"grant_type": "authorization_code",
							"redirect_uri": googleRedirectLink,
						});
						const tokenResponse: Response = await fetch(tokenLink, {
							body: tokenSearchParams,
							headers: {
								"content-type": "application/x-www-form-urlencoded",
							},
							method: "POST",
						});
						if (!tokenResponse.ok) {
							throw new Error();
						}
						const tokenData: any = await tokenResponse.json();
						const accessToken: string = tokenData.access_token;
						// const refreshToken: string = tokenData.refresh_token;
						// const expiresIn: string = tokenData.expires_in;
						const userLink: string = "https://www.googleapis.com/oauth2/v3/userinfo";
						const userResponse: Response = await fetch(userLink, {
							headers: {
								"authorization": `Bearer ${accessToken}`,
							},
						});
						if (!userResponse.ok) {
							throw new Error();
						}
						const userData: any = await userResponse.json();
						const userId: string = userData.sub; // TODO: duration
						const session: string = generateIdentifier();
						googleUsers[session] = userId;
						googleTokens[userId] = accessToken;
						response.setHeader("location", verificationPathname);
						response.setHeader("set-cookie", [
							cookie.serialize("shicka_google_state", "", {
								httpOnly: true,
								maxAge: 0,
								path: "/",
							}),
							cookie.serialize("shicka_google_session", session, {
								httpOnly: true,
								path: "/",
							}),
						]); // TODO: duration
						content = "302 Found";
						contentType = "text/plain; charset=utf-8";
						response.statusCode = 302;
						break;
					}
					case "POST": {
						const originHeader: string | undefined = request.headers.origin;
						if (originHeader !== origin) {
							throw new Error();
						}
						const authorizationLink: string = "https://accounts.google.com/o/oauth2/v2/auth";
						// const codeVerifier: string = generateCodeVerifier();
						// const codeChallenge: string = generateCodeChallenge(codeVerifier);
						const state: string = generateIdentifier();
						const authorizationSearchParams: URLSearchParams = new URLSearchParams({
							"client_id": googleClientId,
							// "code_challenge": codeChallenge,
							// "code_challenge_method": "S256",
							// "prompt": "consent",
							"scope": "https://www.googleapis.com/auth/androidpublisher https://www.googleapis.com/auth/userinfo.profile",
							"state": state,
							"redirect_uri": googleRedirectLink,
							"response_type": "code",
						});
						response.setHeader("location", `${authorizationLink}?${authorizationSearchParams}`);
						response.setHeader("set-cookie", cookie.serialize("shicka_google_state", state, {
							httpOnly: true,
							path: "/",
						})); // TODO: duration
						content = "302 Found";
						contentType = "text/plain; charset=utf-8";
						response.statusCode = 302;
						break;
					}
					default: {
						throw new Error();
					}
				}
				break;
			}
			default: {
				throw new Error();
			}
		}
	} catch (error: unknown) {
		console.warn(error);
		content = "500 Internal Server Error";
		contentType = "text/plain; charset=utf-8";
		response.statusCode = 500;
	}
	response.setHeader("content-type", contentType);
	response.end(content);
});
server.listen(Number(port), (): void => {
	console.log("Server ready!");
});
