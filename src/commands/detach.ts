import type {
	APISelectMenuOption,
	Attachment,
	Client,
	Message,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Detach as DetachCompilation} from "../compilations.js";
import type {Detach as DetachDefinition} from "../definitions.js";
import type {Detach as DetachDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ApplicationCommandType,
	ComponentType,
	MessageType,
} from "discord.js";
import {detach as detachCompilation} from "../compilations.js";
import {detach as detachDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = DetachDependency["help"];
const {
	commandName,
	commandDescription,
	attachmentsOptionName,
	attachmentsOptionDescription,
}: DetachDefinition = detachDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	noAuthorReply: noAuthorReplyLocalizations,
	noInteractionReply: noInteractionReplyLocalizations,
	noReplyReply: noReplyReplyLocalizations,
	tooFewAttachmentsReply: tooFewAttachmentsReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
}: DetachCompilation = detachCompilation;
const detachCommand: Command = {
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
		const {client, locale, targetMessage}: MessageContextMenuCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const {author}: Message<true> = targetMessage;
		const {user}: Client<true> = client;
		if (author.id !== user.id) {
			await interaction.reply({
				content: noAuthorReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		if (targetMessage.interaction != null) {
			await interaction.reply({
				content: noInteractionReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		if (targetMessage.type !== MessageType.Default) {
			await interaction.reply({
				content: noReplyReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		const targetContent: string = targetMessage.content;
		const targetAttachments: Attachment[] = [...targetMessage.attachments.values()];
		if (targetAttachments.length === 0 || targetContent === "" && targetAttachments.length === 1) {
			await interaction.reply({
				content: tooFewAttachmentsReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		await interaction.showModal({
			customId: interaction.id,
			title: commandDescription[resolvedLocale],
			components: [
				{
					type: ComponentType.Label,
					label: attachmentsOptionDescription[resolvedLocale],
					component: {
						type: ComponentType.StringSelect,
						customId: attachmentsOptionName,
						options: targetAttachments.map<APISelectMenuOption>((attachment: Attachment, index: number): APISelectMenuOption => {
							return {
								label: attachment.name.length > 40 ? `${attachment.name.slice(0, 40)}...` : attachment.name,
								value: `${index}`,
							};
						}),
						minValues: 1,
						maxValues: targetContent !== "" ? targetAttachments.length : targetAttachments.length - 1,
					},
				},
			],
		});
		const modalSubmitInteraction: ModalSubmitInteraction<"cached"> = await interaction.awaitModalSubmit({
			filter: (modalSubmitInteraction: ModalSubmitInteraction): boolean => {
				return modalSubmitInteraction.customId === interaction.id;
			},
			time: 900000,
		});
		await modalSubmitInteraction.deferReply({
			ephemeral: true,
		});
		const indices: Set<number> = new Set(modalSubmitInteraction.fields.getStringSelectValues(attachmentsOptionName).map<number>((index: string): number => {
			return Number(index);
		}));
		const files: Attachment[] = targetAttachments.map<Attachment | null>((attachment: Attachment, index: number): Attachment | null => {
			return !indices.has(index) ? attachment : null;
		}).filter<Attachment>((attachment: Attachment | null): attachment is Attachment => {
			return attachment != null;
		});
		try {
			await targetMessage.edit({files});
		} catch {
			await modalSubmitInteraction.editReply({
				content: noPermissionReplyLocalizations[resolvedLocale]({}),
			});
			return;
		}
		function formatMessage(locale: Locale): string {
			return replyLocalizations[locale]({});
		}
		await modalSubmitInteraction.editReply({
			content: formatMessage("en-US"),
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
export default detachCommand;
