import type {
	Guild,
	GuildMember,
	Message,
	MessageContextMenuCommandInteraction,
	MessageReaction,
	PartialMessageReaction,
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
		const applyingRole: Role | null = roles.cache.find((role: Role): boolean => {
			return role.name === commandApplyingRole;
		}) ?? null;
		if (applyingRole == null) {
			return;
		}
		const verifiedRole: Role | null = roles.cache.find((role: Role): boolean => {
			return role.name === commandVerifiedRole;
		}) ?? null;
		if (verifiedRole == null) {
			return;
		}
		const member: GuildMember | null = await (async (): Promise<GuildMember | null> => {
			try {
				const {author}: Message<true> = targetMessage;
				const memberId: string = author.id;
				const member: GuildMember | null = guild.members.cache.get(memberId) ?? null;
				if (member == null || member.partial) {
					return await guild.members.fetch(memberId);
				}
				return member;
			} catch {
				return null;
			}
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
		await targetMessage.react("✅");
		const reaction: MessageReaction | null = targetMessage.reactions.cache.find((reaction: MessageReaction | PartialMessageReaction): reaction is MessageReaction => {
			return !reaction.partial && (reaction.emoji.name ?? "") === "❎";
		}) ?? null;
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
export default approveCommand;
