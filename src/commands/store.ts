import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {compileAll, composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	linkList: () => string,
};
type LinkGroups = {
	title: () => string,
	link: () => string,
};
type Data = {
	title: Localized<string>,
	link: string,
};
const commandName: string = "store";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you where to buy offical products of the game",
	"fr": "Te dit où acheter des produits officiels du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const data: Data[] = [
	{
		title: {
			"en-US": "European",
			"fr": "européen",
		},
		link: "https://superbearadventure.myspreadshop.net/",
	},
	{
		title: {
			"en-US": "American and Oceanian",
			"fr": "américain et océanien",
		},
		link: "https://superbearadventure.myspreadshop.com/",
	},
];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know where to buy offical products of the game",
	"fr": "Tape `/$<commandName>` pour savoir où acheter des produits officiels du jeu",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "You can buy official products of the game there:\n$<linkList>",
	"fr": "Tu peux acheter des produits officiels du jeu là :\n$<linkList>",
});
const linkLocalizations: Localized<((groups: LinkGroups) => string)> = compileAll<LinkGroups>({
	"en-US": "[$<title> store](<$<link>>)",
	"fr": "[Magasin $<title>](<$<link>>)",
});
const storeCommand: Command = {
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
		const {locale}: CommandInteraction = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const links: Localized<(groups: {}) => string>[] = [];
		for (const item of data) {
			const link: Localized<(groups: {}) => string> = composeAll<LinkGroups, {}>(linkLocalizations, localize<LinkGroups>((locale: keyof Localized<unknown>): LinkGroups => {
				return {
					title: (): string => {
						return Util.escapeMarkdown(item.title[locale]);
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
				linkList: (): string => {
					return list(links.map<string>((link: Localized<(groups: {}) => string>): string => {
						return link[resolvedLocale]({});
					}));
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
export default storeCommand;
