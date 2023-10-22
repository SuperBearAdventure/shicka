import type {
	GuildBasedChannel,
	ChatInputCommandInteraction,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Roadmap as RoadmapCompilation} from "../compilations.js";
import type {Roadmap as RoadmapDefinition} from "../definitions.js";
import type {Roadmap as RoadmapDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	ChannelType,
} from "discord.js";
import {roadmap as roadmapCompilation} from "../compilations.js";
import {roadmap as roadmapDefinition} from "../definitions.js";
import {composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = RoadmapDependency["help"];
const {
	commandName,
	commandDescription,
}: RoadmapDefinition = roadmapDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	intentWithChannel: intentWithChannelLocalizations,
	intentWithoutChannel: intentWithoutChannelLocalizations,
}: RoadmapCompilation = roadmapCompilation;
const {
	SHICKA_ROADMAP_INTENT_CHANNEL,
}: NodeJS.ProcessEnv = process.env;
const link: string = "https://trello.com/b/3DPL9CwV/sba-to-do-list";
const commandIntentChannel: string = SHICKA_ROADMAP_INTENT_CHANNEL ?? "";
const roadmapCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {guild, locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const channel: GuildBasedChannel | null = ((): GuildBasedChannel | null => {
			const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
				return channel.name === commandIntentChannel;
			});
			if (channel == null || channel.type === ChannelType.GuildCategory || channel.isThread()) {
				return null;
			}
			return channel;
		})();
		function formatMessage(locale: Locale): string {
			return replyLocalizations[locale]({
				intent: (): string => {
					return channel != null ? intentWithChannelLocalizations[locale]({
						channelMention: (): string => {
							return `<#${channel.id}>`;
						},
					}) : intentWithoutChannelLocalizations[locale]({});
				},
				link: (): string => {
					return link;
				},
			});
		}
		await interaction.reply({
			content: formatMessage("en-US"),
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
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				commandMention: (): string => {
					return `</${commandName}:${applicationCommand.id}>`;
				},
			};
		}));
	},
};
export default roadmapCommand;
