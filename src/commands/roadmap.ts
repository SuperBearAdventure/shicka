import type {
	ApplicationCommandData,
	GuildBasedChannel,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {compileAll, composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	intent: () => string,
	link: () => string,
};
type IntentWithChannelGroups = {
	channel: () => string,
};
type IntentWithoutChannelGroups = {};
const commandName: string = "roadmap";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you where to check the upcoming milestones of the game",
	"fr": "Te dit où consulter les futurs jalons du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const link: string = "https://trello.com/b/3DPL9CwV/road-to-100";
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know where to check the upcoming milestones of the game",
	"fr": "Tape `/$<commandName>` pour savoir où consulter les futurs jalons du jeu",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "$<intent> check upcoming milestones of the game [there](<$<link>>).",
	"fr": "$<intent> consulter de futurs jalons du jeu [là](<$<link>>).",
});
const intentWithChannelLocalizations: Localized<(groups: IntentWithChannelGroups) => string> = compileAll<IntentWithChannelGroups>({
	"en-US": "Before suggesting an idea in $<channel>, you can",
	"fr": "Avant de suggérer une idée dans $<channel>, tu peux",
});
const intentWithoutChannelLocalizations: Localized<(groups: IntentWithoutChannelGroups) => string> = compileAll<IntentWithoutChannelGroups>({
	"en-US": "You can",
	"fr": "Tu peux",
});
const roadmapCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {guild, locale}: CommandInteraction = interaction;
		const resolvedLocale: Locale = resolve(locale);
		if (guild == null) {
			return;
		}
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
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
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
