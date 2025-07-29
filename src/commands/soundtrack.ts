import type {
	ChatInputCommandInteraction,
} from "discord.js";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Soundtrack as SoundtrackCompilation} from "../compilations.js";
import type {Soundtrack as SoundtrackDefinition} from "../definitions.js";
import type {Soundtrack as SoundtrackDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import {JSDOM, VirtualConsole} from "jsdom";
import {soundtrack as soundtrackCompilation} from "../compilations.js";
import {soundtrack as soundtrackDefinition} from "../definitions.js";
import {composeAll, list, localize, naiveStream, resolve} from "../utils/string.js";
type HelpGroups = SoundtrackDependency["help"];
type LinkGroups = SoundtrackDependency["link"];
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
}: SoundtrackDefinition = soundtrackDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	defaultReply: defaultReplyLocalizations,
	link: linkLocalizations,
}: SoundtrackCompilation = soundtrackCompilation;
const titlePattern: RegExp = /^Super Bear Adventure - (.*) \((?:Original Soundtrack|Visualizer)\)$/su;
const viewsPatch: Patch = {
	"No views": "0 views",
	"1 view": "1 views",
};
const viewsPattern: RegExp = /^(.*) views$/su;
const links: string[] = [
	"[*Original Soundtrack*](<https://www.youtube.com/playlist?list=PLDF2V3x1AdQBnalWW0q69H5LF1-wgAxN8>)",
	"[*Pierre Music Kit, Vol. 1*](<https://www.youtube.com/watch?playlist?list=PLDF2V3x1AdQARk2uRTdyEBRfQgeNIfFcZ>)"
];
function patch(text: string, table: Patch): string {
	if (!(text in table)) {
		return text;
	}
	return table[text];
}
async function fetchData(link: string): Promise<Data[] | null> {
	const response: Response = await fetch(link);
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
					title: item.playlistVideoRenderer.title.runs[0].text.replace(titlePattern, "$1"),
					link: `https://www.youtube.com/watch?v=${item.playlistVideoRenderer.videoId}`,
					views: patch(item.playlistVideoRenderer.videoInfo.runs[0].text, viewsPatch).replace(viewsPattern, "$1"),
				};
			});
		} catch {}
	}
	return null;
}
async function fetchOriginalSoundtrackData(): Promise<Data[] | null> {
	const result: Data[] | null = await fetchData("https://www.youtube.com/playlist?list=PLDF2V3x1AdQBnalWW0q69H5LF1-wgAxN8");
	return result;
}
async function fetchPierreMusicKitVolume1Data(): Promise<Data[] | null> {
	const result: Data[] | null = await fetchData("https://www.youtube.com/playlist?list=PLDF2V3x1AdQARk2uRTdyEBRfQgeNIfFcZ");
	return result;
}
const soundtrackCommand: Command = {
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
		try {
			const originalSoundtrackData: Data[] | null = await fetchOriginalSoundtrackData();
			if (originalSoundtrackData == null) {
				throw new Error();
			}
			const pierreMusicKitVolume1Data: Data[] | null = await fetchPierreMusicKitVolume1Data();
			if (pierreMusicKitVolume1Data == null) {
				throw new Error();
			}
			const data: Data[] = [
				...originalSoundtrackData,
				...pierreMusicKitVolume1Data,
			];
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
			const persistentContent: string = formatMessage("en-US");
			const persistentContentChunks: string[] = naiveStream(persistentContent);
			let replied: boolean = false;
			for (const chunk of persistentContentChunks) {
				if (!replied) {
					await interaction.reply({
						content: chunk,
					});
					replied = true;
					continue;
				}
				await interaction.followUp({
					content: chunk,
				});
			}
			if (resolvedLocale === "en-US") {
				return;
			}
			const ephemeralContent: string = formatMessage(resolvedLocale);
			const ephemeralContentChunks: string[] = naiveStream(ephemeralContent);
			for (const chunk of ephemeralContentChunks) {
				if (!replied) {
					await interaction.reply({
						content: chunk,
						ephemeral: true,
					});
					replied = true;
					continue;
				}
				await interaction.followUp({
					content: chunk,
					ephemeral: true,
				});
			}
		} catch (error: unknown) {
			console.warn(error);
			const linkList: string = list(links);
			function formatMessage(locale: Locale): string {
				return defaultReplyLocalizations[locale]({
					linkList: (): string => {
						return linkList;
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
}
export default soundtrackCommand;
