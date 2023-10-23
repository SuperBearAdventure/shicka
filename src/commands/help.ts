import type {
	ApplicationCommandPermissions,
	AutoModerationAction,
	AutoModerationActionMetadata,
	AutoModerationRule,
	ChatInputCommandInteraction,
	Client,
	ClientApplication,
	Collection,
	GuildBasedChannel,
	GuildMember,
	NewsChannel,
	Role,
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
	ApplicationCommandPermissionType,
	PermissionsBitField,
} from "discord.js";
import * as commands from "../commands.js";
import {help as helpCompilation} from "../compilations.js";
import {help as helpDefinition} from "../definitions.js";
import * as hooks from "../hooks.js";
import * as rules from "../rules.js";
import {composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = HelpDependency["help"];
const {
	commandName,
	commandDescription,
}: HelpDefinition = helpDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
}: HelpCompilation = helpCompilation;
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
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {client, guild, locale, member}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const channel: GuildBasedChannel | null = ((): GuildBasedChannel | null => {
			const {channel}: ChatInputCommandInteraction<"cached"> = interaction;
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
		const applicationCommands: Collection<string, ApplicationCommand> = guild.commands.cache;
		const permissions: Collection<string, ApplicationCommandPermissions[]> | undefined = await (async (): Promise<Collection<string, ApplicationCommandPermissions[]> | undefined> => {
			try {
				return await guild.commands.permissions.fetch({});
			} catch {}
		})();
		if (permissions == null) {
			return;
		}
		const webhooks: Collection<string, Webhook> | undefined = await (async (): Promise<Collection<string, Webhook> | undefined> => {
			try {
				return await guild.fetchWebhooks();
			} catch {}
		})();
		if (webhooks == null) {
			return;
		}
		const autoModerationRules: Collection<string, AutoModerationRule> | undefined = await (async (): Promise<Collection<string, AutoModerationRule> | undefined> => {
			try {
				return await guild.autoModerationRules.fetch();
			} catch {}
		})();
		if (autoModerationRules == null) {
			return;
		}
		const {user}: Client<true> = client;
		const descriptions: Localized<(groups: {}) => string>[] = [
			Object.keys(commands).map<Localized<(groups: {}) => string> | null>((commandName: string): Localized<(groups: {}) => string> | null => {
				const command: Command = commands[commandName as keyof typeof commands];
				const applicationCommand: ApplicationCommand | undefined = applicationCommands.find((applicationCommand: ApplicationCommand): boolean => {
					return applicationCommand.name === commandName;
				});
				if (applicationCommand == null) {
					return null;
				}
				if (!hasPermission(permissions, applicationCommand.client.application, applicationCommand, channel, member)) {
					return null;
				}
				const description: Localized<(groups: {}) => string> | null = command.describe(applicationCommand);
				return description;
			}),
			Object.keys(hooks).map<Localized<(groups: {}) => string> | null>((hookName: string): Localized<(groups: {}) => string> | null => {
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
			}),
			Object.keys(rules).map<Localized<(groups: {}) => string> | null>((ruleName: string): Localized<(groups: {}) => string> | null => {
				const rule: Rule = rules[ruleName as keyof typeof rules];
				const autoModerationRule: AutoModerationRule | undefined = autoModerationRules.find((autoModerationRule: AutoModerationRule): boolean => {
					return autoModerationRule.name === ruleName;
				});
				if (autoModerationRule == null) {
					return null;
				}
				if (autoModerationRule.creatorId !== user.id) {
					return null;
				}
				if (!autoModerationRule.enabled) {
					return null;
				}
				const channels: (TextChannel | NewsChannel)[] = autoModerationRule.actions.map<TextChannel | NewsChannel | null>((action: AutoModerationAction): TextChannel | NewsChannel | null => {
					const {metadata}: AutoModerationAction = action;
					const {channelId}: AutoModerationActionMetadata = metadata;
					if (channelId == null) {
						return null
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
			}),
		].flat<(Localized<(groups: {}) => string> | null)[][]>().filter<Localized<(groups: {}) => string>>((description: Localized<(groups: {}) => string> | null): description is Localized<(groups: {}) => string> => {
			return description != null;
		});
		const features: Localized<(groups: {}) => string[]> = localize<(groups: {}) => string[]>((locale: Locale): (groups: {}) => string[] => {
			return (groups: {}): string[] => {
				return descriptions.map<string[]>((description: Localized<(groups: {}) => string>): string[] => {
					return description[locale](groups).split("\n");
				}).flat<string[][]>();
			};
		});
		function formatMessage(locale: Locale): string {
			return replyLocalizations[locale]({
				memberMention: (): string => {
					return `<@${member.id}>`;
				},
				featureList: (): string => {
					return list(features[locale]({}));
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
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				commandMention: (): string => {
					return `</${commandName}:${applicationCommand.id}>`;
				},
			};
		}));
	},
};
export default helpCommand;
