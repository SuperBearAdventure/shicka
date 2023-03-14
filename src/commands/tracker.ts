import type {
	ApplicationCommandData,
	GuildBasedChannel,
	ChatInputCommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Tracker as TrackerCompilation} from "../compilations.js";
import type {Tracker as TrackerDefinition} from "../definitions.js";
import type {Tracker as TrackerDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import {tracker as trackerCompilation} from "../compilations.js";
import {tracker as trackerDefinition} from "../definitions.js";
import {composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = TrackerDependency["help"];
type LinkGroups = TrackerDependency["link"];
type Data = {
	title: Localized<string>,
	link: string,
};
const {
	commandName,
	commandDescription,
}: TrackerDefinition = trackerDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	intentWithChannel: intentWithChannelLocalizations,
	intentWithoutChannel: intentWithoutChannelLocalizations,
	link: linkLocalizations,
}: TrackerCompilation = trackerCompilation;
const data: Data[] = [
	{
		title: {
			"en-US": "Current",
			"fr": "actuel",
			"pt-BR": "atual",
		},
		link: "https://github.com/SuperBearAdventure/tracker",
	},
	{
		title: {
			"en-US": "Former",
			"fr": "antérieur",
			"pt-BR": "antigo",
		},
		link: "https://trello.com/b/yTojOuqv/super-bear-adventure-bugs",
	},
];
const trackerCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
		};
	},
	async execute(interaction: Interaction<"cached">): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {guild, locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "🐛│bug-report";
		});
		const links: Localized<(groups: {}) => string>[] = [];
		for (const item of data) {
			const link: Localized<(groups: {}) => string> = composeAll<LinkGroups, {}>(linkLocalizations, localize<LinkGroups>((locale: Locale): LinkGroups => {
				return {
					title: (): string => {
						return escapeMarkdown(item.title[locale]);
					},
					link: (): string => {
						return item.link;
					},
				};
			}));
			links.push(link);
		}
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				intent: (): string => {
					return channel != null ? intentWithChannelLocalizations["en-US"]({
						channel: (): string => {
							return `${channel}`;
						},
					}) : intentWithoutChannelLocalizations["en-US"]({});
				},
				linkList: (): string => {
					return list(links.map<string>((link: Localized<(groups: {}) => string>): string => {
						return link["en-US"]({});
					}));
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
				linkList: (): string => {
					return list(links.map<string>((link: Localized<(groups: {}) => string>): string => {
						return link[resolvedLocale]({});
					}));
				},
			}),
			ephemeral: true,
		});
	},
	describe(interaction: ChatInputCommandInteraction<"cached">): Localized<(groups: {}) => string> | null {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
			};
		}));
	},
};
export default trackerCommand;
