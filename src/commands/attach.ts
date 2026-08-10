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
import type {Attach as AttachCompilation} from "../compilations.js";
import type {Attach as AttachDefinition} from "../definitions.js";
import type {Attach as AttachDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ApplicationCommandType,
	ComponentType,
	MessageType,
} from "discord.js";
import {attach as attachCompilation} from "../compilations.js";
import {attach as attachDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = AttachDependency["help"];
type InBetweenPositionGroups = AttachDependency["inBetweenPosition"];
const {
	commandName,
	commandDescription,
	positionOptionName,
	positionOptionDescription,
	attachmentsOptionName,
	attachmentsOptionDescription,
}: AttachDefinition = attachDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	noAuthorReply: noAuthorReplyLocalizations,
	noInteractionReply: noInteractionReplyLocalizations,
	noReplyReply: noReplyReplyLocalizations,
	tooManyAttachmentsReply: tooManyAttachmentsReplyLocalizations,
	noPermissionReply: noPermissionReplyLocalizations,
	startPosition: startPositionLocalizations,
	inBetweenPosition: inBetweenPositionLocalizations,
	endPosition: endPositionLocalizations,
}: AttachCompilation = attachCompilation;
const attachCommand: Command = {
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
		const targetAttachments: Attachment[] = [...targetMessage.attachments.values()];
		if (targetAttachments.length === 10) {
			await interaction.reply({
				content: tooManyAttachmentsReplyLocalizations[resolvedLocale]({}),
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
					label: positionOptionDescription[resolvedLocale],
					component: {
						type: ComponentType.StringSelect,
						customId: positionOptionName,
						options: [
							...targetAttachments.map<APISelectMenuOption>((attachment: Attachment, index: number): APISelectMenuOption => {
								return {
									label: index === 0 ? startPositionLocalizations[resolvedLocale]({}) : composeAll<InBetweenPositionGroups, {}>(inBetweenPositionLocalizations, localize<InBetweenPositionGroups>((): InBetweenPositionGroups => {
										const previousAttachment: Attachment = targetAttachments[index - 1];
										const nextAttachment: Attachment = attachment;
										return {
											previousAttachmentMention: (): string => {
												return previousAttachment.name.length > 40 ? `${previousAttachment.name.slice(0, 40)}...` : previousAttachment.name;
											},
											nextAttachmentMention: (): string => {
												return nextAttachment.name.length > 40 ? `${nextAttachment.name.slice(0, 40)}...` : nextAttachment.name;
											},
										};
									}))[resolvedLocale]({}),
									value: `${index}`,
								};
							}),
							{
								label: endPositionLocalizations[resolvedLocale]({}),
								value: `${targetAttachments.length}`,
							},
						],
					},
				},
				{
					type: ComponentType.Label,
					label: attachmentsOptionDescription[resolvedLocale],
					component: {
						type: ComponentType.FileUpload,
						customId: attachmentsOptionName,
						minValues: 1,
						maxValues: 10 - targetAttachments.length,
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
		const index: number = Number(modalSubmitInteraction.fields.getStringSelectValues(positionOptionName)[0]);
		const files: Attachment[] = [...targetAttachments.slice(0, index), ...modalSubmitInteraction.fields.getUploadedFiles(attachmentsOptionName, true).values(), ...targetAttachments.slice(index)];
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
export default attachCommand;
