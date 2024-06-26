import type {
	Guild,
	GuildMember,
	Message,
	MessageContextMenuCommandInteraction,
	MessageReaction,
	Role,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Approve as ApproveCompilation} from "../compilations.js";
import type {Approve as ApproveDefinition} from "../definitions.js";
import type {Approve as ApproveDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ApplicationCommandType,
} from "discord.js";
import {approve as approveCompilation} from "../compilations.js";
import {approve as approveDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = ApproveDependency["help"];
const {
	commandName,
	commandDescription,
}: ApproveDefinition = approveDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	noMemberReply: noMemberReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
}: ApproveCompilation = approveCompilation;
const {
	SHICKA_APPLICATION_APPLYING_ROLE,
	SHICKA_VERIFICATION_VERIFIED_ROLE,
}: NodeJS.ProcessEnv = process.env;
const commandApplyingRole: string = SHICKA_APPLICATION_APPLYING_ROLE ?? "";
const commandVerifiedRole: string = SHICKA_VERIFICATION_VERIFIED_ROLE ?? "";
const approveCommand: Command = {
	register(): ApplicationCommandData {
		return {
			type: ApplicationCommandType.Message,
			name: commandName,
			nameLocalizations: commandDescription,
			defaultMemberPermissions: [],
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isMessageContextMenuCommand()) {
			return;
		}
		const {guild, locale, targetMessage}: MessageContextMenuCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const {roles}: Guild = guild;
		const applyingRole: Role | undefined = roles.cache.find((role: Role): boolean => {
			return role.name === commandApplyingRole;
		});
		if (applyingRole == null) {
			return;
		}
		const verifiedRole: Role | undefined = roles.cache.find((role: Role): boolean => {
			return role.name === commandVerifiedRole;
		});
		if (verifiedRole == null) {
			return;
		}
		const member: GuildMember | undefined = await (async (): Promise<GuildMember | undefined> => {
			try {
				const {author, member}: Message<true> = targetMessage;
				if (member == null) {
					const memberId: string = author.id;
					const member: GuildMember | undefined = guild.members.cache.get(memberId);
					if (member == null) {
						return await guild.members.fetch(memberId);
					}
					return member;
				}
				return member;
			} catch {}
		})();
		if (member == null) {
			await interaction.reply({
				content: noMemberReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		try {
			await member.roles.add(verifiedRole);
			await member.roles.remove(applyingRole);
		} catch {
			await interaction.reply({
				content: noPermissionReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		try {
			await targetMessage.react("✅");
			const reaction: MessageReaction | undefined = targetMessage.reactions.cache.find((reaction: MessageReaction): boolean => {
				return (reaction.emoji.name ?? "") === "❎";
			});
			if (reaction != null) {
				await reaction.users.remove();
			}
		} catch {}
		function formatMessage(locale: Locale): string {
			return replyLocalizations[locale]({});
		}
		await interaction.reply({
			content: formatMessage("en-US"),
			ephemeral: true,
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: formatMessage(resolvedLocale),
			ephemeral: true,
		});
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				commandMention: (): string => {
					return commandDescription[locale];
				},
			};
		}));
	},
};
export default approveCommand;
