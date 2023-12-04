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
	SHICKA_APPLICATION_APPLYING_ROLE,
	SHICKA_VERIFICATION_VERIFIED_ROLE,
}: NodeJS.ProcessEnv = process.env;
const commandApplyingRole: string = SHICKA_APPLICATION_APPLYING_ROLE ?? "";
const commandVerifiedRole: string = SHICKA_VERIFICATION_VERIFIED_ROLE ?? "";
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
				if (member == null) {
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
			await member.roles.remove(verifiedRole);
			await member.roles.remove(applyingRole);
		} catch {
			await interaction.reply({
				content: noPermissionReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		await targetMessage.react("❎");
		const reaction: MessageReaction | null = targetMessage.reactions.cache.find((reaction: MessageReaction): boolean => {
			return (reaction.emoji.name ?? "") === "✅";
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
export default refuseCommand;
