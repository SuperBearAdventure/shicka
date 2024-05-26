import type {
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Patch as PatchCompilation} from "../compilations.js";
import type {Patch as PatchDefinition} from "../definitions.js";
import type {Patch as PatchDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ApplicationCommandType,
	ComponentType,
	TextInputStyle,
} from "discord.js";
import {patch as patchCompilation} from "../compilations.js";
import {patch as patchDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = PatchDependency["help"];
const {
	commandName,
	commandDescription,
	contentOptionName,
	contentOptionDescription,
}: PatchDefinition = patchDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	noInteractionReply: noInteractionReplyLocalizations,
	noContentOrAttachmentReply: noContentOrAttachmentReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
}: PatchCompilation = patchCompilation;
const patchCommand: Command = {
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
		const {locale, targetMessage}: MessageContextMenuCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		if (targetMessage.interaction != null) {
			await interaction.reply({
				content: noInteractionReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		await interaction.showModal({
			customId: interaction.id,
			title: contentOptionDescription[resolvedLocale],
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.TextInput,
							style: TextInputStyle.Paragraph,
							customId: contentOptionName,
							label: contentOptionName,
							required: false,
							value: targetMessage.content,
							minLength: 0,
							maxLength: 2000,
						},
					],
				},
			],
		});
		const modalSubmitInteraction: ModalSubmitInteraction<"cached"> = await interaction.awaitModalSubmit({
			filter: (modalSubmitInteraction: ModalSubmitInteraction): boolean => {
				return modalSubmitInteraction.customId === interaction.id;
			},
			time: 900000,
		});
		const content: string | null = modalSubmitInteraction.fields.getTextInputValue(contentOptionName) || null;
		if (content == null && targetMessage.attachments.size === 0) {
			await modalSubmitInteraction.reply({
				content: noContentOrAttachmentReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		try {
			await targetMessage.edit({content});
		} catch {
			await modalSubmitInteraction.reply({
				content: noPermissionReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		function formatMessage(locale: Locale): string {
			return replyLocalizations[locale]({});
		}
		await modalSubmitInteraction.reply({
			content: formatMessage("en-US"),
			ephemeral: true,
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await modalSubmitInteraction.followUp({
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
export default patchCommand;
