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
import type {Refuse as RefuseCompilation} from "../compilations.js";
import type {Refuse as RefuseDefinition} from "../definitions.js";
import type {Refuse as RefuseDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ApplicationCommandType,
} from "discord.js";
import {refuse as refuseCompilation} from "../compilations.js";
import {refuse as refuseDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = RefuseDependency["help"];
const {
	commandName,
	commandDescription,
}: RefuseDefinition = refuseDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	noMemberReply: noMemberReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
}: RefuseCompilation = refuseCompilation;
const {
	SHICKA_APPROVAL_VERIFICATION_ROLE,
	SHICKA_REFUSAL_APPLICATION_ROLE,
}: NodeJS.ProcessEnv = process.env;
const commandApplicationRole: string = SHICKA_REFUSAL_APPLICATION_ROLE ?? "";
const commandVerificationRole: string = SHICKA_APPROVAL_VERIFICATION_ROLE ?? "";
const refuseCommand: Command = {
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
		const applicationRole: Role | undefined = roles.cache.find((role: Role): boolean => {
			return role.name === commandApplicationRole;
		});
		if (applicationRole == null) {
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
			await member.roles.remove(verificationRole);
			await member.roles.remove(applicationRole);
		} catch {
			await interaction.reply({
				content: noPermissionReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		await targetMessage.react("❎");
		const reaction: MessageReaction | undefined = targetMessage.reactions.cache.find((reaction: MessageReaction): boolean => {
			return (reaction.emoji.name ?? "") === "✅";
		});
		if (reaction != null) {
			await reaction.users.remove();
		}
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
		await interaction.reply({
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
export default refuseCommand;