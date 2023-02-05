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
	link: () => string,
};
type LinkGroups = {
	title: () => string,
	link: () => string,
	views: () => string,
};
type Data = {
	title: string,
	link: string,
	views: string,
};
type Patch = {
	[k in string]: string
};
const commandName: string = "trailer";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you where to watch official trailers of the game",
	"fr": "Te dit où regarder des bandes-annonces officielles du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const titlePatch: Patch = {
	"Super Bear Adventure - Official Game Trailer": "Super Bear Adventure - Graphics Update Trailer"
};
const titlePattern: RegExp = /^Super Bear Adventure - (.*) Trailer$/su;
const viewsPatch: Patch = {
	"No views": "0 views",
	"1 view": "1 views",
};
const viewsPattern: RegExp = /^(.*) views$/su;
const link: string = "https://www.youtube.com/playlist?list=PLEJBkn30KcVVuA8Z0s_NLruYrbvzV5ieK";
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know where to watch official trailers of the game",
	"fr": "Tape `/$<commandName>` pour savoir où regarder des bandes-annonces officielles du jeu",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "You can watch official trailers of the game there:\n$<linkList>",
	"fr": "Tu peux regarder des bandes-annonces officielles du jeu là :\n$<linkList>",
});
const defaultReplyLocalizations: Localized<(groups: DefaultReplyGroups) => string> = compileAll<DefaultReplyGroups>({
	"en-US": "You can watch official trailers of the game [there](<$<link>>).",
	"fr": "Tu peux regarder des bandes-annonces officielles du jeu [là](<$<link>>).",
});
const linkLocalizations: Localized<((groups: LinkGroups) => string)> = compileAll<LinkGroups>({
	"en-US": "[*$<title>* trailer](<$<link>>) (*$<views>* views)",
	"fr": "[Bande-annonce *$<title>*](<$<link>>) (*$<views>* views)",
});
function patch(text: string, table: Patch): string {
	if (!(text in table)) {
		return text;
	}
	return table[text];
}
const trailerCommand: Command = {
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
			const data: Data[] | null = await (async (): Promise<Data[] | null> => {
				const response: Response = await fetch("https://www.youtube.com/playlist?list=PLEJBkn30KcVVuA8Z0s_NLruYrbvzV5ieK");
				const {window}: JSDOM = new JSDOM(await response.text());
				const scripts: HTMLElement[] = [...window.document.querySelectorAll<HTMLElement>("script")];
				for (const {textContent} of scripts) {
					if (textContent == null || !textContent.startsWith("var ytInitialData = ") || !textContent.endsWith(";")) {
						continue;
					}
					try {
						const json: string = textContent.slice(textContent.indexOf("var ytInitialData = ") + 20, textContent.lastIndexOf(";"));
						const result: any = JSON.parse(json);
						return result.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents.map((item: any): Data => {
							return {
								title: patch(item.playlistVideoRenderer.title.runs[0].text, titlePatch).replace(titlePattern, "$1"),
								link: `https://www.youtube.com/watch?v=${item.playlistVideoRenderer.videoId}`,
								views: patch(item.playlistVideoRenderer.videoInfo.runs[0].text, viewsPatch).replace(viewsPattern, "$1"),
							};
						});
					} catch (error: unknown) {
						console.log(error)
					}
				}
				return null;
			})();
			if (data == null) {
				throw new Error();
			}
			const links: Localized<(groups: {}) => string>[] = [];
			for (const item of data) {
				const link: Localized<(groups: {}) => string> = composeAll<LinkGroups, {}>(linkLocalizations, localize<LinkGroups>((): LinkGroups => {
					return {
						title: (): string => {
							return Util.escapeMarkdown(item.title);
						},
						link: (): string => {
							return item.link;
						},
						views: (): string => {
							return Util.escapeMarkdown(item.views);
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
		} catch (error: unknown) {
			console.warn(error);
			await interaction.reply({
				content: defaultReplyLocalizations["en-US"]({
					link: (): string => {
						return link;
					},
				}),
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await interaction.followUp({
				content: defaultReplyLocalizations[resolvedLocale]({
					link: (): string => {
						return link;
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
export default trailerCommand;
