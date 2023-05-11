import type {
	ApplicationCommandData,
	ChatInputCommandInteraction,
	Interaction,
} from "discord.js";
import type {Response} from "node-fetch";
import type Command from "../commands.js";
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
];
const updateCommand: Command = {
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
			const androidData: Data | null = await (async (): Promise<Data | null> => {
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
			})();
			if (androidData == null) {
				throw new Error();
			}
			const iosData: Data | null = await (async (): Promise<Data | null> => {
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
							return escapeMarkdown(item.title);
						},
						link: (): string => {
							return item.link;
						},
						date: (): string => {
							const dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
								dateStyle: "long",
								timeZone: "UTC",
							});
							return escapeMarkdown(dateFormat.format(item.date));
						},
						version: (): string => {
							return escapeMarkdown(item.version);
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
export default updateCommand;
