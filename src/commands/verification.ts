import type {
	Guild,
	Message,
	MessageReaction,
	Role,
	MessageContextMenuCommandInteraction,
	GuildMember,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Verification as VerificationCompilation} from "../compilations.js";
import type {Verification as VerificationDefinition} from "../definitions.js";
import type {Verification as VerificationDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ApplicationCommandType,
} from "discord.js";
import {verification as verificationCompilation} from "../compilations.js";
import {verification as verificationDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = VerificationDependency["help"];
const {
	commandName,
	commandDescription,
}: VerificationDefinition = verificationDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	noMemberReply: noMemberReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
}: VerificationCompilation = verificationCompilation;
const {
	SHICKA_APPROVAL_VERIFICATION_ROLE,
	SHICKA_REFUSAL_UNVERIFICATION_ROLE,
}: NodeJS.ProcessEnv = process.env;
const commandUnverificationRole: string = SHICKA_REFUSAL_UNVERIFICATION_ROLE ?? "";
const commandVerificationRole: string = SHICKA_APPROVAL_VERIFICATION_ROLE ?? "";
const verificationCommand: Command = {
	register(): ApplicationCommandData {
		return {
			type: ApplicationCommandType.Message,
			name: commandName,
			nameLocalizations: commandDescription,
			defaultMemberPermissions: [],
			dmPermission: false,
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isMessageContextMenuCommand()) {
			return;
		}
		const {guild, locale, targetMessage}: MessageContextMenuCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const {roles}: Guild = guild;
		const unverificationRole: Role | undefined = roles.cache.find((role: Role): boolean => {
			return role.name === commandUnverificationRole;
		});
		if (unverificationRole == null) {
			return;
		}
		const verificationRole: Role | undefined = roles.cache.find((role: Role): boolean => {
			return role.name === commandVerificationRole;
		});
		if (verificationRole == null) {
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
			await member.roles.add(verificationRole);
			await member.roles.remove(unverificationRole);
		} catch {
			await interaction.reply({
				content: noPermissionReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		await targetMessage.react("✅");
		const reaction: MessageReaction | undefined = targetMessage.reactions.cache.find((reaction: MessageReaction): boolean => {
			return (reaction.emoji.name ?? "") === "❎";
		});
		if (reaction != null) {
			await reaction.users.remove();
		}
		await interaction.reply({
			content: replyLocalizations[resolvedLocale]({}),
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
export default verificationCommand;
