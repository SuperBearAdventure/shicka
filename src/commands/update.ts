import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type {Response} from "node-fetch";
import type Command from "../commands.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {JSDOM} from "jsdom";
import fetch from "node-fetch";
import {compileAll, composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	linkList: () => string,
};
type DefaultReplyGroups = {
	linkList: () => string,
};
type LinkGroups = {
	title: () => string,
	link: () => string,
	version: () => string,
	date: () => string,
};
type Data = {
	title: string,
	link: string,
	version: string,
	date: Date,
};
const commandName: string = "update";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you what is the latest update of the game",
	"fr": "Te dit quelle est la dernière mise à jour du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const links: string[] = [
	"[*Android*](<https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer>)",
	"[*iOS*](<https://apps.apple.com/app/id1531842415>)",
];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know what is the latest update of the game",
	"fr": "Tape `/$<commandName>` pour savoir quelle est la dernière mise à jour du jeu",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "You can check and download the latest update of the game there:\n$<linkList>",
	"fr": "Tu peux consulter et télécharger la dernière mise à jour du jeu là :\n$<linkList>",
});
const defaultReplyLocalizations: Localized<(groups: DefaultReplyGroups) => string> = compileAll<DefaultReplyGroups>({
	"en-US": "You can check and download the latest update of the game there:\n$<linkList>",
	"fr": "Tu peux consulter et télécharger la dernière mise à jour du jeu là :\n$<linkList>",
});
const linkLocalizations: Localized<((groups: LinkGroups) => string)> = compileAll<LinkGroups>({
	"en-US": "[*$<title>* platform](<$<link>>) (*$<version>* version as of *$<date>*)",
	"fr": "[Plateforme *$<title>*](<$<link>>) (version *$<version>* au *$<date>*)",
});
const updateCommand: Command = {
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
		try {
			const androidData: Data | null = await (async (): Promise<Data | null> => {
				const response: Response = await fetch("https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer");
				const {window}: JSDOM = new JSDOM(await response.text());
				const scripts: HTMLElement[] = [...window.document.querySelectorAll<HTMLElement>("body > script")];
				for (const {textContent} of scripts) {
					if (textContent == null || !textContent.startsWith("AF_initDataCallback({") || !textContent.endsWith("});")) {
						continue;
					}
					try {
						const result: any = JSON.parse(textContent.slice(textContent.indexOf(", data:") + 7, textContent.lastIndexOf(", sideChannel: ")));
						return {
							title: "Android",
							link: "https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer",
							version: result[1][2][140][0][0][0],
							date: new Date(result[1][2][145][0][1][0] * 1000),
						};
					} catch {}
				}
				return null;
			})();
			if (androidData == null) {
				throw new Error();
			}
			const iosData: Data | null = await (async (): Promise<Data | null> => {
				const response: Response = await fetch("https://itunes.apple.com/lookup?id=1531842415&entity=software") ;
				const data: any = await response.json();
				for (const result of data.results) {
					try {
						return {
							title: "iOS",
							link: "https://apps.apple.com/app/id1531842415",
							version: result.version,
							date: new Date(result.currentVersionReleaseDate),
						};
					} catch {}
				}
				return null;
			})();
			if (iosData == null) {
				throw new Error();
			}
			const data: Data[] = [androidData, iosData];
			const links: Localized<(groups: {}) => string>[] = [];
			for (const item of data) {
				const link: Localized<(groups: {}) => string> = composeAll<LinkGroups, {}>(linkLocalizations, localize<LinkGroups>((locale: Locale): LinkGroups => {
					return {
						title: (): string => {
							return Util.escapeMarkdown(item.title);
						},
						link: (): string => {
							return item.link;
						},
						date: (): string => {
							const dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
								dateStyle: "long",
								timeZone: "UTC",
							});
							return Util.escapeMarkdown(dateFormat.format(item.date));
						},
						version: (): string => {
							return Util.escapeMarkdown(item.version);
						},
					};
				}));
				links.push(link);
			}
			await interaction.reply({
				content: replyLocalizations["en-US"]({
					linkList: (): string => {
						return list(links.map<string>((link: Localized<(groups: {}) => string>): string => {
							return link["en-US"]({})
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
							return link[resolvedLocale]({})
						}));
					},
				}),
				ephemeral: true,
			});
		} catch (error: unknown) {
			console.warn(error);
			const linkList: string = list(links);
			await interaction.reply({
				content: defaultReplyLocalizations["en-US"]({
					linkList: (): string => {
						return linkList;
					},
				}),
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await interaction.followUp({
				content: defaultReplyLocalizations[resolvedLocale]({
					linkList: (): string => {
						return linkList;
					},
				}),
				ephemeral: true,
			});
		}
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
export default updateCommand;
