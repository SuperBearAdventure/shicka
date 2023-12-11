import type {
	ChatInputCommandInteraction,
} from "discord.js";
import type {Response} from "node-fetch";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Update as UpdateCompilation} from "../compilations.js";
import type {Update as UpdateDefinition} from "../definitions.js";
import type {Update as UpdateDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {
	escapeMarkdown,
} from "discord.js";
import {JSDOM, VirtualConsole} from "jsdom";
import fetch from "node-fetch";
import {update as updateCompilation} from "../compilations.js";
import {update as updateDefinition} from "../definitions.js";
import {composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = UpdateDependency["help"];
type LinkGroups = UpdateDependency["link"];
type Data = {
	title: string,
	link: string,
	version: string,
	date: Date,
};
const {
	commandName,
	commandDescription,
}: UpdateDefinition = updateDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	defaultReply: defaultReplyLocalizations,
	link: linkLocalizations,
}: UpdateCompilation = updateCompilation;
const links: string[] = [
	"[*Android*](<https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer>)",
	"[*iOS*](<https://apps.apple.com/app/id1531842415>)",
	"[*Switch*](<https://www.nintendo.com/store/products/super-bear-adventure-switch/>)",
];
async function fetchAndroidData(): Promise<Data | null> {
	const response: Response = await fetch("https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer");
	const {window}: JSDOM = new JSDOM(await response.text(), {
		virtualConsole: new VirtualConsole(),
	});
	const scripts: HTMLElement[] = [...window.document.querySelectorAll<HTMLElement>("body > script")];
	for (const {textContent} of scripts) {
		if (textContent == null || !textContent.startsWith("AF_initDataCallback({") || !textContent.endsWith("});")) {
			continue;
		}
		try {
			const json: string = textContent.slice(textContent.indexOf(", data:") + 7, textContent.lastIndexOf(", sideChannel: "));
			const result: any = JSON.parse(json);
			return {
				title: "Android",
				link: "https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer",
				version: result[1][2][140][0][0][0],
				date: new Date(result[1][2][145][0][1][0] * 1000),
			};
		} catch {}
	}
	return null;
}
async function fetchIosData(): Promise<Data | null> {
	const response: Response = await fetch("https://apps.apple.com/app/id1531842415");
	const {window}: JSDOM = new JSDOM(await response.text());
	const scripts: HTMLElement[] = [...window.document.querySelectorAll<HTMLElement>("body > script")];
	for (const {textContent} of scripts) {
		if (textContent == null || !textContent.startsWith("{\"") || !textContent.endsWith("}")) {
			continue;
		}
		try {
			const json: string = `${Object.entries(JSON.parse(textContent)).filter((entry: [string, any]): boolean => {
				return entry[0].includes("1531842415");
			})[0][1]}`;
			const result: any = JSON.parse(json);
			return {
				title: "iOS",
				link: "https://apps.apple.com/app/id1531842415",
				version: result.d[0].attributes.platformAttributes.ios.versionHistory[0].versionDisplay,
				date: new Date(result.d[0].attributes.platformAttributes.ios.versionHistory[0].releaseTimestamp),
			};
		} catch {}
	}
	return null;
}
async function fetchSwitchData(): Promise<Data | null> {
	const response: Response = await fetch("https://www.nintendo.com/store/products/super-bear-adventure-switch/");
	const {window}: JSDOM = new JSDOM(await response.text());
	const scripts: HTMLElement[] = [...window.document.querySelectorAll<HTMLElement>("body > script")];
	for (const {textContent} of scripts) {
		if (textContent == null || !textContent.startsWith("{\"props\":") || !textContent.endsWith("}")) {
			continue;
		}
		try {
			const json: string =  textContent.slice(textContent.indexOf("{\"pageProps\":") + 13, textContent.lastIndexOf(",\"__N_SSP\":"));
			const result: any = JSON.parse(json);
			return {
				title: "Switch",
				link: "https://www.nintendo.com/store/products/super-bear-adventure-switch/",
				version: "10.5.0+",
				date: new Date(result.initialApolloState[`StoreProduct:${JSON.stringify({
					sku: result.analytics.product.sku,
					locale: "en_US",
				})}`].releaseDate),
			};
		} catch {}
	}
	return null;
}
const updateCommand: Command = {
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
			const androidData: Data | null = await fetchAndroidData();
			if (androidData == null) {
				throw new Error();
			}
			const iosData: Data | null = await fetchIosData();
			if (iosData == null) {
				throw new Error();
			}
			const switchData: Data | null = await fetchSwitchData();
			if (switchData == null) {
				throw new Error();
			}
			const data: Data[] = [androidData, iosData, switchData];
			const links: Localized<(groups: {}) => string>[] = [];
			for (const item of data) {
				const link: Localized<(groups: {}) => string> = composeAll<LinkGroups, {}>(linkLocalizations, localize<LinkGroups>((locale: Locale): LinkGroups => {
					const dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
						dateStyle: "long",
						timeZone: "UTC",
					});
					return {
						title: (): string => {
							return escapeMarkdown(item.title);
						},
						link: (): string => {
							return item.link;
						},
						date: (): string => {
							return escapeMarkdown(dateFormat.format(item.date));
						},
						version: (): string => {
							return escapeMarkdown(item.version);
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
};
export default updateCommand;
