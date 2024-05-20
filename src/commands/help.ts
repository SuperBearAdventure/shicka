import type {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandPermissions,
	AutoModerationAction,
	AutoModerationActionMetadata,
	AutoModerationRule,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	Client,
	ClientApplication,
	GuildBasedChannel,
	GuildMember,
	NewsChannel,
	Role,
	Snowflake,
	TextChannel,
	Webhook,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Help as HelpCompilation} from "../compilations.js";
import type {Help as HelpDefinition} from "../definitions.js";
import type {Help as HelpDependency} from "../dependencies.js";
import type Hook from "../hooks.js";
import type Rule from "../rules.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ApplicationCommandOptionType,
	ApplicationCommandPermissionType,
	ApplicationCommandType,
	Collection,
	PermissionsBitField,
} from "discord.js";
import * as commands from "../commands.js";
import {help as helpCompilation} from "../compilations.js";
import {help as helpDefinition} from "../definitions.js";
import * as hooks from "../hooks.js";
import * as rules from "../rules.js";
import {composeAll, list, localize, nearest, resolve} from "../utils/string.js";
type HelpGroups = HelpDependency["help"];
type Feature = {
	id: number,
	type: "command" | "hook" | "rule",
	name: string,
};
const {
	commandName,
	commandDescription,
	featureOptionName,
	featureOptionDescription,
}: HelpDefinition = helpDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	bareReply: bareReplyLocalizations,
	noFeatureReply: noFeatureReplyLocalizations,
}: HelpCompilation = helpCompilation;
const commandCount: number = Object.getOwnPropertyNames(commands).length;
const hookCount: number = Object.getOwnPropertyNames(hooks).length;
const features: Feature[] = [
	...Object.getOwnPropertyNames(commands).map<Feature>((commandName: string, commandIndex: number): Feature => {
		return {
			id: commandIndex,
			type: "command",
			name: commandName,
		};
	}),
	...Object.getOwnPropertyNames(hooks).map<Feature>((hookName: string, hookIndex: number): Feature => {
		return {
			id: commandCount + hookIndex,
			type: "hook",
			name: hookName,
		};
	}),
	...Object.getOwnPropertyNames(rules).map<Feature>((ruleName: string, ruleIndex: number): Feature => {
		return {
			id: commandCount + hookCount + ruleIndex,
			type: "rule",
			name: ruleName,
		};
	}),
];
const guildFetchedTimestamps: Collection<Snowflake, number> = new Collection<Snowflake, number>();
const guildApplicationCommandPermissions: Collection<Snowflake, Collection<string, ApplicationCommandPermissions[]> | undefined> = new Collection<Snowflake, Collection<string, ApplicationCommandPermissions[]> | undefined>();
const guildWebhooks: Collection<Snowflake, Collection<Snowflake, Webhook> | undefined> = new Collection<Snowflake, Collection<Snowflake, Webhook> | undefined>();
const guildAutoModerationRules: Collection<Snowflake, Collection<Snowflake, AutoModerationRule> | undefined> = new Collection<Snowflake, Collection<Snowflake, AutoModerationRule> | undefined>();
function naiveStream(content: string): string[] {
	content = content.replace(/^\n+|\n+$/g, "").replace(/\n+/g, "\n");
	if (content.length === 0) {
		return [];
	}
	if (content[content.length - 1] !== "\n") {
		content = `${content}\n`;
	}
	const lines: string[] = content.split(/(?<=\n)/);
	const chunks: string[] = [];
	const chunk: string[] = [];
	let length: number = 0;
	for (const line of lines) {
		if (length > 0 && length + line.length > 2000) {
			chunks.push(chunk.join(""));
			chunk.length = 0;
			length = 0;
		}
		const spans: string[] = line.slice(0, -1).match(/[^]{1,1999}/g) ?? [];
		const firstSpans: string[] = spans.slice(0, -1);
		for (const span of firstSpans) {
			chunks.push(`${span}\n`);
		}
		const lastSpan: string = spans[spans.length - 1];
		chunk.push(`${lastSpan}\n`);
		length += lastSpan.length + 1;
	}
	if (length > 0) {
		chunks.push(chunk.join(""));
	}
	return chunks;
}
function hasAdministratorPermission(channel: GuildBasedChannel, member: GuildMember): boolean {
	if (channel.guild.ownerId === member.id) {
		return true;
	}
	return member.permissions.has(PermissionsBitField.All);
}
function hasChannelPermission(permissions: Collection<string, ApplicationCommandPermissions[]>, applicationOrCommand: ClientApplication | ApplicationCommand, channel: GuildBasedChannel): boolean | null {
	const allChannelsId: string = `${BigInt(channel.guild.id) - 1n}`;
	const applicationOrCommandPermissions: ApplicationCommandPermissions[] | undefined = permissions.get(applicationOrCommand.id);
	if (applicationOrCommandPermissions == null) {
		return null;
	}
	const channelPermission: ApplicationCommandPermissions | undefined = applicationOrCommandPermissions.find((permission: ApplicationCommandPermissions): boolean => {
		return permission.type === ApplicationCommandPermissionType.Channel && permission.id === channel.id;
	});
	if (channelPermission != null) {
		return channelPermission.permission;
	}
	const allChannelsPermission: ApplicationCommandPermissions | undefined = applicationOrCommandPermissions.find((permission: ApplicationCommandPermissions): boolean => {
		return permission.type === ApplicationCommandPermissionType.Channel && permission.id === allChannelsId;
	});
	if (allChannelsPermission != null) {
		return allChannelsPermission.permission;
	}
	return null;
}
function hasMemberPermission(permissions: Collection<string, ApplicationCommandPermissions[]>, applicationOrCommand: ClientApplication | ApplicationCommand, member: GuildMember): boolean | null {
	const allUsersId: string = member.guild.id;
	const applicationOrCommandPermissions: ApplicationCommandPermissions[] | undefined = permissions.get(applicationOrCommand.id);
	if (applicationOrCommandPermissions == null) {
		return null;
	}
	const userPermission: ApplicationCommandPermissions | undefined = applicationOrCommandPermissions.find((permission: ApplicationCommandPermissions): boolean => {
		return permission.type === ApplicationCommandPermissionType.User && permission.id === member.id;
	});
	if (userPermission != null) {
		return userPermission.permission;
	}
	const roleCommandPermissions: ApplicationCommandPermissions[] = applicationOrCommandPermissions.filter((permission: ApplicationCommandPermissions): boolean => {
		return permission.type === ApplicationCommandPermissionType.Role && member.roles.cache.some((role: Role): boolean => {
			return permission.id === role.id;
		});
	});
	if (roleCommandPermissions.length !== 0) {
		return roleCommandPermissions.some((permission: ApplicationCommandPermissions): boolean => {
			return permission.permission;
		});
	}
	const allUsersPermission: ApplicationCommandPermissions | undefined = applicationOrCommandPermissions.find((permission: ApplicationCommandPermissions): boolean => {
		return permission.type === ApplicationCommandPermissionType.User && permission.id === allUsersId;
	});
	if (allUsersPermission != null) {
		return allUsersPermission.permission;
	}
	return null;
}
function hasDefaultPermission(command: ApplicationCommand, channel: GuildBasedChannel, member: GuildMember): boolean {
	if (command.defaultMemberPermissions == null) {
		return true;
	}
	if (command.defaultMemberPermissions.toArray().length === 0) {
		return false;
	}
	return channel.permissionsFor(member).has(command.defaultMemberPermissions);
}
function hasPermission(permissions: Collection<string, ApplicationCommandPermissions[]>, application: ClientApplication, command: ApplicationCommand, channel: GuildBasedChannel, member: GuildMember): boolean {
	if (hasAdministratorPermission(channel, member)) {
		return true;
	}
	const commandChannelPermission: boolean | null = hasChannelPermission(permissions, command, channel);
	if (commandChannelPermission != null) {
		if (!commandChannelPermission) {
			return false;
		}
	} else {
		const applicationChannelPermission: boolean | null = hasChannelPermission(permissions, application, channel);
		if (applicationChannelPermission != null && !applicationChannelPermission) {
			return false;
		}
	}
	const commandMemberPermission: boolean | null = hasMemberPermission(permissions, command, member);
	if (commandMemberPermission != null) {
		return commandMemberPermission;
	} else {
		const applicationMemberPermission: boolean | null = hasMemberPermission(permissions, application, member);
		if (applicationMemberPermission != null && !applicationMemberPermission) {
			return false;
		}
	}
	return hasDefaultPermission(command, channel, member);
}
function hasManageWebhooksPermission(channel: GuildBasedChannel, member: GuildMember): boolean {
	if (hasAdministratorPermission(channel, member)) {
		return true;
	}
	return channel.permissionsFor(member).has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageWebhooks]);
}
function hasManageAutoModerationRulesPermission(channel: GuildBasedChannel, member: GuildMember): boolean {
	if (hasAdministratorPermission(channel, member)) {
		return true;
	}
	return channel.permissionsFor(member).has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageGuild]);
}
const helpCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: featureOptionName,
					description: featureOptionDescription["en-US"],
					descriptionLocalizations: featureOptionDescription,
					minValue: 0,
					maxValue: features.length - 1,
					autocomplete: true,
				},
			],
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		const {client, createdTimestamp, member, guild}: ApplicationUserInteraction = interaction;
		const fetchedTimestamp: number = guildFetchedTimestamps.get(guild.id) ?? Number.NEGATIVE_INFINITY;
		const elapsedTime: number = createdTimestamp - fetchedTimestamp;
		const forceFetch: boolean = elapsedTime >= 60000;
		if (forceFetch) {
			guildFetchedTimestamps.set(guild.id, createdTimestamp);
		}
		const applicationCommands: Collection<string, ApplicationCommand> = guild.commands.cache;
		const permissions: Collection<string, ApplicationCommandPermissions[]> | undefined = await (async (): Promise<Collection<string, ApplicationCommandPermissions[]> | undefined> => {
			if (forceFetch) {
				try {
					guildApplicationCommandPermissions.set(guild.id, await guild.commands.permissions.fetch({}));
				} catch {
					guildApplicationCommandPermissions.delete(guild.id);
				}
			}
			return guildApplicationCommandPermissions.get(guild.id);
		})();
		if (permissions == null) {
			return;
		}
		const webhooks: Collection<string, Webhook> | undefined = await (async (): Promise<Collection<string, Webhook> | undefined> => {
			if (forceFetch) {
				try {
					guildWebhooks.set(guild.id, await guild.fetchWebhooks());
				} catch {
					guildWebhooks.delete(guild.id);
				}
			}
			return guildWebhooks.get(guild.id);
		})();
		if (webhooks == null) {
			return;
		}
		const autoModerationRules: Collection<string, AutoModerationRule> | undefined = await (async (): Promise<Collection<string, AutoModerationRule> | undefined> => {
			if (forceFetch) {
				try {
					guildAutoModerationRules.set(guild.id, await guild.autoModerationRules.fetch());
				} catch {
					guildAutoModerationRules.delete(guild.id);
				}
			}
			return guildAutoModerationRules.get(guild.id);
		})();
		if (autoModerationRules == null) {
			return;
		}
		const channel: GuildBasedChannel | null = ((): GuildBasedChannel | null => {
			const {channel}: ApplicationUserInteraction = interaction;
			if (channel == null) {
				return null;
			}
			if (channel.isThread()) {
				return channel.parent;
			}
			return channel;
		})();
		if (channel == null) {
			return;
		}
		const {user}: Client<true> = client;
		if (interaction.isAutocomplete()) {
			const {locale, options}: AutocompleteInteraction<"cached"> = interaction;
			const resolvedLocale: Locale = resolve(locale);
			const {name, value}: AutocompleteFocusedOption = options.getFocused(true);
			if (name !== featureOptionName) {
				await interaction.respond([]);
				return;
			}
			const results: Feature[] = nearest<Feature>(value.toLocaleLowerCase(resolvedLocale), features, 7, (feature: Feature): string => {
				const {name}: Feature = feature;
				return name.toLocaleLowerCase(resolvedLocale);
			});
			const suggestions: ApplicationCommandOptionChoiceData[] = results.map<ApplicationCommandOptionChoiceData<number> | null>((feature: Feature): ApplicationCommandOptionChoiceData<number> | null => {
				const {id, type, name}: Feature = feature;
				const featureName: string = `${name} (${type})`;
				switch (type) {
					case "command": {
						const commandName: string = name;
						const applicationCommand: ApplicationCommand | undefined = applicationCommands.find((applicationCommand: ApplicationCommand): boolean => {
							return applicationCommand.name === commandName;
						});
						if (applicationCommand == null) {
							return null;
						}
						if (applicationCommand.guild == null) {
							return null;
						}
						if (applicationCommand.type !== ApplicationCommandType.ChatInput && applicationCommand.type !== ApplicationCommandType.Message) {
							return null;
						}
						if (applicationCommand.applicationId !== user.id) {
							return null;
						}
						if (!hasPermission(permissions, applicationCommand.client.application, applicationCommand, channel, member)) {
							return null;
						}
						break;
					}
					case "hook": {
						const hookName: string = name;
						const webhook: Webhook | undefined = webhooks.find((webhook: Webhook): boolean => {
							return webhook.name === hookName;
						});
						if (webhook == null) {
							return null;
						}
						if (!webhook.isIncoming()) {
							return null;
						}
						const {channel, owner}: Webhook = webhook;
						if (owner == null || owner.id !== user.id) {
							return null;
						}
						if (channel == null || !hasManageWebhooksPermission(channel, member)) {
							return null;
						}
						break;
					}
					case "rule": {
						const ruleName: string = feature.name;
						const autoModerationRule: AutoModerationRule | undefined = autoModerationRules.find((autoModerationRule: AutoModerationRule): boolean => {
							return autoModerationRule.name === ruleName;
						});
						if (autoModerationRule == null) {
							return null;
						}
						if (!autoModerationRule.enabled) {
							return null;
						}
						if (autoModerationRule.creatorId !== user.id) {
							return null;
						}
						const channels: (TextChannel | NewsChannel)[] = autoModerationRule.actions.map<TextChannel | NewsChannel | null>((action: AutoModerationAction): TextChannel | NewsChannel | null => {
							const {metadata}: AutoModerationAction = action;
							const {channelId}: AutoModerationActionMetadata = metadata;
							if (channelId == null) {
								return null;
							}
							const channel: GuildBasedChannel | undefined = autoModerationRule.guild.channels.cache.get(channelId);
							if (channel == null || channel.isThread() || channel.isVoiceBased() || !channel.isTextBased()) {
								return null;
							}
							return channel;
						}).filter<TextChannel | NewsChannel>((channel: TextChannel | NewsChannel | null): channel is TextChannel | NewsChannel => {
							return channel != null;
						});
						if (channels.length === 0 || channels.some((channel: TextChannel | NewsChannel): boolean => {
							return !hasManageAutoModerationRulesPermission(channel, member);
						})) {
							return null;
						}
						break;
					}
				}
				return {
					name: featureName,
					value: id,
				};
			}).filter<ApplicationCommandOptionChoiceData<number>>((suggestion: ApplicationCommandOptionChoiceData<number> | null): suggestion is ApplicationCommandOptionChoiceData<number> => {
				return suggestion != null;
			});
			await interaction.respond(suggestions);
			return;
		}
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {locale, options}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const id: number | null = options.getInteger(featureOptionName);
		if (id == null) {
		const descriptions: Localized<(groups: {}) => string>[] = features.map<Localized<(groups: {}) => string> | null>((feature: Feature): Localized<(groups: {}) => string> | null => {
			switch (feature.type) {
				case "command": {
					const commandName: string = feature.name;
					const command: Command = commands[commandName as keyof typeof commands];
					const applicationCommand: ApplicationCommand | undefined = applicationCommands.find((applicationCommand: ApplicationCommand): boolean => {
						return applicationCommand.name === commandName;
					});
					if (applicationCommand == null) {
						return null;
					}
					if (applicationCommand.guild == null) {
						return null;
					}
					if (applicationCommand.type !== ApplicationCommandType.ChatInput && applicationCommand.type !== ApplicationCommandType.Message) {
						return null;
					}
					if (applicationCommand.applicationId !== user.id) {
						return null;
					}
					if (!hasPermission(permissions, applicationCommand.client.application, applicationCommand, channel, member)) {
						return null;
					}
					const description: Localized<(groups: {}) => string> | null = command.describe(applicationCommand);
					return description;
				}
				case "hook": {
					const hookName: string = feature.name;
					const hook: Hook = hooks[hookName as keyof typeof hooks];
					const webhook: Webhook | undefined = webhooks.find((webhook: Webhook): boolean => {
						return webhook.name === hookName;
					});
					if (webhook == null) {
						return null;
					}
					if (!webhook.isIncoming()) {
						return null;
					}
					const {channel, owner}: Webhook = webhook;
					if (owner == null || owner.id !== user.id) {
						return null;
					}
					if (channel == null || !hasManageWebhooksPermission(channel, member)) {
						return null;
					}
					const description: Localized<(groups: {}) => string> | null = hook.describe(webhook);
					return description;
				}
				case "rule": {
					const ruleName: string = feature.name;
					const rule: Rule = rules[ruleName as keyof typeof rules];
					const autoModerationRule: AutoModerationRule | undefined = autoModerationRules.find((autoModerationRule: AutoModerationRule): boolean => {
						return autoModerationRule.name === ruleName;
					});
					if (autoModerationRule == null) {
						return null;
					}
					if (!autoModerationRule.enabled) {
						return null;
					}
					if (autoModerationRule.creatorId !== user.id) {
						return null;
					}
					const channels: (TextChannel | NewsChannel)[] = autoModerationRule.actions.map<TextChannel | NewsChannel | null>((action: AutoModerationAction): TextChannel | NewsChannel | null => {
						const {metadata}: AutoModerationAction = action;
						const {channelId}: AutoModerationActionMetadata = metadata;
						if (channelId == null) {
							return null;
						}
						const channel: GuildBasedChannel | undefined = autoModerationRule.guild.channels.cache.get(channelId);
						if (channel == null || channel.isThread() || channel.isVoiceBased() || !channel.isTextBased()) {
							return null;
						}
						return channel;
					}).filter<TextChannel | NewsChannel>((channel: TextChannel | NewsChannel | null): channel is TextChannel | NewsChannel => {
						return channel != null;
					});
					if (channels.length === 0 || channels.some((channel: TextChannel | NewsChannel): boolean => {
						return !hasManageAutoModerationRulesPermission(channel, member);
					})) {
						return null;
					}
					const description: Localized<(groups: {}) => string> = rule.describe(autoModerationRule);
					return description;
				}
			}
		}).filter<Localized<(groups: {}) => string>>((description: Localized<(groups: {}) => string> | null): description is Localized<(groups: {}) => string> => {
			return description != null;
		});
		const subfeatures: Localized<(groups: {}) => string[]> = localize<(groups: {}) => string[]>((locale: Locale): (groups: {}) => string[] => {
			return (groups: {}): string[] => {
				return descriptions.map<string[]>((description: Localized<(groups: {}) => string>): string[] => {
					return description[locale](groups).split("\n");
				}).flat<string[][]>();
			};
		});
		function formatMessage(locale: Locale): string {
			return bareReplyLocalizations[locale]({
				memberMention: (): string => {
					return `<@${member.id}>`;
				},
				featureList: (): string => {
					return list(subfeatures[locale]({}));
				},
			});
		}
		const persistentContent: string = formatMessage("en-US");
		const persistentContentChunks: string[] = naiveStream(persistentContent);
		let replied: boolean = false;
		for (const chunk of persistentContentChunks) {
			if (!replied) {
				await interaction.reply({
					content: chunk,
					allowedMentions: {
						users: [],
					},
				});
				replied = true;
				continue;
			}
			await interaction.followUp({
				content: chunk,
				allowedMentions: {
					users: [],
				},
			});
		}
		if (resolvedLocale === "en-US") {
			return;
		}
		const ephemeralContent: string = formatMessage(resolvedLocale);
		const ephemeralContentChunks: string[] = naiveStream(ephemeralContent);
		for (const chunk of ephemeralContentChunks) {
			if (!replied) {
				await interaction.reply({
					content: chunk,
					ephemeral: true,
					allowedMentions: {
						users: [],
					},
				});
				replied = true;
				continue;
			}
			await interaction.followUp({
				content: chunk,
				ephemeral: true,
				allowedMentions: {
					users: [],
				},
			});
		}
		return;
		}
		const description: Localized<(groups: {}) => string> | null = ((): Localized<(groups: {}) => string> | null => {
			const feature: Feature = features[id];
			switch (feature.type) {
				case "command": {
					const commandName: string = feature.name;
					const command: Command = commands[commandName as keyof typeof commands];
					const applicationCommand: ApplicationCommand | undefined = applicationCommands.find((applicationCommand: ApplicationCommand): boolean => {
						return applicationCommand.name === commandName;
					});
					if (applicationCommand == null) {
						return null;
					}
					if (applicationCommand.guild == null) {
						return null;
					}
					if (applicationCommand.type !== ApplicationCommandType.ChatInput && applicationCommand.type !== ApplicationCommandType.Message) {
						return null;
					}
					if (applicationCommand.applicationId !== user.id) {
						return null;
					}
					if (!hasPermission(permissions, applicationCommand.client.application, applicationCommand, channel, member)) {
						return null;
					}
					const description: Localized<(groups: {}) => string> | null = command.describe(applicationCommand);
					return description;
				}
				case "hook": {
					const hookName: string = feature.name;
					const hook: Hook = hooks[hookName as keyof typeof hooks];
					const webhook: Webhook | undefined = webhooks.find((webhook: Webhook): boolean => {
						return webhook.name === hookName;
					});
					if (webhook == null) {
						return null;
					}
					if (!webhook.isIncoming()) {
						return null;
					}
					const {channel, owner}: Webhook = webhook;
					if (owner == null || owner.id !== user.id) {
						return null;
					}
					if (channel == null || !hasManageWebhooksPermission(channel, member)) {
						return null;
					}
					const description: Localized<(groups: {}) => string> | null = hook.describe(webhook);
					return description;
				}
				case "rule": {
					const ruleName: string = feature.name;
					const rule: Rule = rules[ruleName as keyof typeof rules];
					const autoModerationRule: AutoModerationRule | undefined = autoModerationRules.find((autoModerationRule: AutoModerationRule): boolean => {
						return autoModerationRule.name === ruleName;
					});
					if (autoModerationRule == null) {
						return null;
					}
					if (!autoModerationRule.enabled) {
						return null;
					}
					if (autoModerationRule.creatorId !== user.id) {
						return null;
					}
					const channels: (TextChannel | NewsChannel)[] = autoModerationRule.actions.map<TextChannel | NewsChannel | null>((action: AutoModerationAction): TextChannel | NewsChannel | null => {
						const {metadata}: AutoModerationAction = action;
						const {channelId}: AutoModerationActionMetadata = metadata;
						if (channelId == null) {
							return null;
						}
						const channel: GuildBasedChannel | undefined = autoModerationRule.guild.channels.cache.get(channelId);
						if (channel == null || channel.isThread() || channel.isVoiceBased() || !channel.isTextBased()) {
							return null;
						}
						return channel;
					}).filter<TextChannel | NewsChannel>((channel: TextChannel | NewsChannel | null): channel is TextChannel | NewsChannel => {
						return channel != null;
					});
					if (channels.length === 0 || channels.some((channel: TextChannel | NewsChannel): boolean => {
						return !hasManageAutoModerationRulesPermission(channel, member);
					})) {
						return null;
					}
					const description: Localized<(groups: {}) => string> = rule.describe(autoModerationRule);
					return description;
				}
			}
		})();
		if (description == null) {
			function formatMessage(locale: Locale): string {
				return noFeatureReplyLocalizations[locale]({
					memberMention: (): string => {
						return `<@${member.id}>`;
					},
				});
			}
			await interaction.reply({
				content: formatMessage("en-US"),
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await interaction.followUp({
				content: formatMessage(resolvedLocale),
				ephemeral: true,
			});
			return;
		}
		const subfeatures: Localized<(groups: {}) => string[]> = localize<(groups: {}) => string[]>((locale: Locale): (groups: {}) => string[] => {
			return (groups: {}): string[] => {
				return description[locale](groups).split("\n");
			};
		});
		function formatMessage(locale: Locale): string {
			return replyLocalizations[locale]({
				memberMention: (): string => {
					return `<@${member.id}>`;
				},
				featureList: (): string => {
					return list(subfeatures[locale]({}));
				},
			});
		}
		const persistentContent: string = formatMessage("en-US");
		const persistentContentChunks: string[] = naiveStream(persistentContent);
		let replied: boolean = false;
		for (const chunk of persistentContentChunks) {
			if (!replied) {
				await interaction.reply({
					content: chunk,
					allowedMentions: {
						users: [],
					},
				});
				replied = true;
				continue;
			}
			await interaction.followUp({
				content: chunk,
				allowedMentions: {
					users: [],
				},
			});
		}
		if (resolvedLocale === "en-US") {
			return;
		}
		const ephemeralContent: string = formatMessage(resolvedLocale);
		const ephemeralContentChunks: string[] = naiveStream(ephemeralContent);
		for (const chunk of ephemeralContentChunks) {
			if (!replied) {
				await interaction.reply({
					content: chunk,
					ephemeral: true,
					allowedMentions: {
						users: [],
					},
				});
				replied = true;
				continue;
			}
			await interaction.followUp({
				content: chunk,
				ephemeral: true,
				allowedMentions: {
					users: [],
				},
			});
		}
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				commandMention: (): string => {
					return `</${commandName}:${applicationCommand.id}>`;
				},
				featureOptionDescription: (): string => {
					return featureOptionDescription[locale];
				},
			};
		}));
	},
};
export default helpCommand;
