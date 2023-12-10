import type {
	ChatInputCommandInteraction,
	Guild,
	Role,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Apply as ApplyCompilation} from "../compilations.js";
import type {Apply as ApplyDefinition} from "../definitions.js";
import type {Apply as ApplyDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {apply as applyCompilation} from "../compilations.js";
import {apply as applyDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = ApplyDependency["help"];
const {
	commandName,
	commandDescription,
}: ApplyDefinition = applyDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
}: ApplyCompilation = applyCompilation;
const {
	SHICKA_APPROVAL_VERIFICATION_ROLE,
	SHICKA_REFUSAL_APPLICATION_ROLE,
}: NodeJS.ProcessEnv = process.env;
const commandApplicationRole: string = SHICKA_REFUSAL_APPLICATION_ROLE ?? "";
const commandVerificationRole: string = SHICKA_APPROVAL_VERIFICATION_ROLE ?? "";
const applyCommand: Command = {
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
		try {
			await member.roles.add(applicationRole);
			await member.roles.remove(verificationRole);
		} catch {
			await interaction.reply({
				content: noPermissionReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
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
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				commandMention: (): string => {
					return `</${commandName}:${applicationCommand.id}>`;
				},
			};
		}));
	},
};
export default applyCommand;
