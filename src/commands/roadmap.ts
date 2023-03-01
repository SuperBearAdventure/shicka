import type {
	ApplicationCommandData,
	GuildBasedChannel,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Roadmap as RoadmapCompilation} from "../compilations.js";
import type {Roadmap as RoadmapDefinition} from "../definitions.js";
import type {Roadmap as RoadmapDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
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
const link: string = "https://trello.com/b/3DPL9CwV/sba-to-do-list";
const roadmapCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
		};
	},
	async execute(interaction: Interaction<"cached">): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {guild, locale}: CommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "💡│game-suggestions";
		});
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				intent: (): string => {
					return channel != null ? intentWithChannelLocalizations["en-US"]({
						channel: (): string => {
							return `${channel}`;
						},
					}) : intentWithoutChannelLocalizations["en-US"]({});
				},
				link: (): string => {
					return link;
				},
			}),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: replyLocalizations[resolvedLocale]({
				intent: (): string => {
					return channel != null ? intentWithChannelLocalizations[resolvedLocale]({
						channel: (): string => {
							return `${channel}`;
						},
					}) : intentWithoutChannelLocalizations[resolvedLocale]({});
				},
				link: (): string => {
					return link;
				},
			}),
			ephemeral: true,
		});
	},
	describe(interaction: CommandInteraction<"cached">): Localized<(groups: {}) => string> | null {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
			};
		}));
	},
};
export default roadmapCommand;
