import type {
	ChatInputCommandInteraction,
	Guild,
	Role,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Verify as VerifyCompilation} from "../compilations.js";
import type {Verify as VerifyDefinition} from "../definitions.js";
import type {Verify as VerifyDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import {verify as verifyCompilation} from "../compilations.js";
import {verify as verifyDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = VerifyDependency["help"];
const {
	commandName,
	commandDescription,
}: VerifyDefinition = verifyDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
}: VerifyCompilation = verifyCompilation;
const {
	SHICKA_APPLICATION_APPLYING_ROLE,
	SHICKA_VERIFICATION_VERIFIED_ROLE,
}: NodeJS.ProcessEnv = process.env;
const commandApplyingRole: string = SHICKA_APPLICATION_APPLYING_ROLE ?? "";
const commandVerifiedRole: string = SHICKA_VERIFICATION_VERIFIED_ROLE ?? "";
const verifyCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
			defaultMemberPermissions: [],
			dmPermission: false,
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {member, guild, locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const {name, roles}: Guild = guild;
		const applyingRole: Role | undefined = roles.cache.find((role: Role): boolean => {
			return role.name === commandApplyingRole;
		});
		const verifiedRole: Role | undefined = roles.cache.find((role: Role): boolean => {
			return role.name === commandVerifiedRole;
		});
		if (verifiedRole == null) {
			return;
		}
		try {
			await member.roles.add(verifiedRole);
			if (applyingRole != null) {
				await member.roles.remove(applyingRole);
			}
		} catch {
			await interaction.reply({
				content: noPermissionReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		function formatMessage(locale: Locale): string {
			return replyLocalizations[locale]({
				name: escapeMarkdown(name),
			});
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
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				commandMention: `</${commandName}:${applicationCommand.id}>`,
			};
		}));
	},
};
export default verifyCommand;
