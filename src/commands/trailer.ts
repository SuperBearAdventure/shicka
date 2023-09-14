import type {
	ApplicationCommand,
	ApplicationCommandData,
	ChatInputCommandInteraction,
	Interaction,
} from "discord.js";
import type {Response} from "node-fetch";
import type Command from "../commands.js";
import type {Trailer as TrailerCompilation} from "../compilations.js";
import type {Trailer as TrailerDefinition} from "../definitions.js";
import type {Trailer as TrailerDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import {JSDOM, VirtualConsole} from "jsdom";
import fetch from "node-fetch";
import {trailer as trailerCompilation} from "../compilations.js";
import {trailer as trailerDefinition} from "../definitions.js";
import {composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = TrailerDependency["help"];
type LinkGroups = TrailerDependency["link"];
type Data = {
	title: string,
	link: string,
	views: string,
};
type Patch = {
	[k in string]: string
};
const {
	commandName,
	commandDescription,
}: TrailerDefinition = trailerDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	defaultReply: defaultReplyLocalizations,
	link: linkLocalizations,
}: TrailerCompilation = trailerCompilation;
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
function patch(text: string, table: Patch): string {
	if (!(text in table)) {
		return text;
	}
	return table[text];
}
async function fetchData(): Promise<Data[] | null> {
	const response: Response = await fetch("https://www.youtube.com/playlist?list=PLEJBkn30KcVVuA8Z0s_NLruYrbvzV5ieK");
	const {window}: JSDOM = new JSDOM(await response.text(), {
		virtualConsole: new VirtualConsole(),
	});
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
		} catch {}
	}
	return null;
}
const trailerCommand: Command = {
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
		const {locale}: ChatInputCommandInteraction<"cached"> = interaction;
		const resolvedLocale: Locale = resolve(locale);
		try {
			const data: Data[] | null = await fetchData();
			if (data == null) {
				throw new Error();
			}
			const links: Localized<(groups: {}) => string>[] = [];
			for (const item of data) {
				const link: Localized<(groups: {}) => string> = composeAll<LinkGroups, {}>(linkLocalizations, localize<LinkGroups>((): LinkGroups => {
					return {
						title: (): string => {
							return escapeMarkdown(item.title);
						},
						link: (): string => {
							return item.link;
						},
						views: (): string => {
							return escapeMarkdown(item.views);
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
		} catch (error: unknown) {
			console.warn(error);
			function formatMessage(locale: Locale): string {
				return defaultReplyLocalizations[locale]({
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
		}
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
export default trailerCommand;
