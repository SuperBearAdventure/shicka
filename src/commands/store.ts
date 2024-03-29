import type {
	ChatInputCommandInteraction,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Store as StoreCompilation} from "../compilations.js";
import type {Store as StoreDefinition} from "../definitions.js";
import type {Store as StoreDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import {store as storeCompilation} from "../compilations.js";
import {store as storeDefinition} from "../definitions.js";
import {composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = StoreDependency["help"];
type LinkGroups = StoreDependency["link"];
type Data = {
	title: Localized<string>,
	link: string,
};
const {
	commandName,
	commandDescription,
}: StoreDefinition = storeDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	link: linkLocalizations,
}: StoreCompilation = storeCompilation;
const data: Data[] = [
	{
		title: {
			"en-US": "European",
			"fr": "européen",
			"pt-BR": "Européia",
		},
		link: "https://superbearadventure.myspreadshop.net/",
	},
	{
		title: {
			"en-US": "American and Oceanian",
			"fr": "américain et océanien",
			"pt-BR": "Americana e Oceânica",
		},
		link: "https://superbearadventure.myspreadshop.com/",
	},
];
const storeCommand: Command = {
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
		const {locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
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
		function formatMessage(locale: Locale): string {
			return replyLocalizations[locale]({
				linkList: (): string => {
					return list(links.map<string>((link: Localized<(groups: {}) => string>): string => {
						return link[locale]({});
					}));
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
export default storeCommand;
