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
	androidVersion: () => string,
	androidDate: () => string,
	iosVersion: () => string,
	iosDate: () => string,
};
type DefaultReplyGroups = {
	linkList: () => string,
};
type Data = {
	version: string,
	date: number,
};
const commandName: string = "update";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you what is the latest update of the game",
	"fr": "Te dit quelle est la dernière mise à jour du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const updates: string[] = [
	"[*Android*](<https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer>)",
	"[*iOS*](<https://apps.apple.com/app/id1531842415>)",
];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know what is the latest update of the game",
	"fr": "Tape `/$<commandName>` pour savoir quelle est la dernière mise à jour du jeu",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "The latest update of the game is:\n\u{2022} **$<androidVersion>** on **Android** (*$<androidDate>*)\n\u{2022} **$<iosVersion>** on **iOS** (*$<iosDate>*)",
	"fr": "La dernière mise à jour du jeu est :\n\u{2022} **$<androidVersion>** sur **Android** (*$<androidDate>*)\n\u{2022} **$<iosVersion>** sur **iOS** (*$<iosDate>*)",
});
const defaultReplyLocalizations: Localized<(groups: DefaultReplyGroups) => string> = compileAll<DefaultReplyGroups>({
	"en-US": "You can check and download the latest update of the game there:\n$<linkList>",
	"fr": "Tu peux consulter et télécharger la dernière mise à jour du jeu là :\n$<linkList>",
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
				const {window}: JSDOM = await JSDOM.fromURL("https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer");
				const scripts: HTMLElement[] = [...window.document.querySelectorAll<HTMLElement>("body > script")];
				for (const {textContent} of scripts) {
					if (textContent == null || !textContent.startsWith("AF_initDataCallback({") || !textContent.endsWith("});")) {
						continue;
					}
					try {
						const result: any = JSON.parse(textContent.slice(textContent.indexOf(", data:") + 7, textContent.lastIndexOf(", sideChannel: ")));
						return {
							version: result[1][2][140][0][0][0],
							date: result[1][2][145][0][1][0] * 1000,
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
							version: result.version,
							date: new Date(result.currentVersionReleaseDate).getTime(),
						};
					} catch {}
				}
				return null;
			})();
			if (iosData == null) {
				throw new Error();
			}
			const androidVersion: string = androidData.version;
			const androidDate: Date = new Date(androidData.date);
			const iosVersion: string = iosData.version;
			const iosDate: Date = new Date(iosData.date);
			await interaction.reply({
				content: replyLocalizations["en-US"]({
					androidVersion: (): string => {
						return Util.escapeMarkdown(androidVersion);
					},
					androidDate: (): string => {
						const dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
							dateStyle: "long",
							timeZone: "UTC",
						});
						return Util.escapeMarkdown(dateFormat.format(androidDate));
					},
					iosVersion: (): string => {
						return Util.escapeMarkdown(iosVersion);
					},
					iosDate: (): string => {
						const dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
							dateStyle: "long",
							timeZone: "UTC",
						});
						return Util.escapeMarkdown(dateFormat.format(iosDate));
					},
				}),
			});
			if (resolvedLocale === "en-US") {
				return;
			}
			await interaction.followUp({
				content: replyLocalizations[resolvedLocale]({
					androidVersion: (): string => {
						return Util.escapeMarkdown(androidVersion);
					},
					androidDate: (): string => {
						const dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(resolvedLocale, {
							dateStyle: "long",
							timeZone: "UTC",
						});
						return Util.escapeMarkdown(dateFormat.format(androidDate));
					},
					iosVersion: (): string => {
						return Util.escapeMarkdown(iosVersion);
					},
					iosDate: (): string => {
						const dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(resolvedLocale, {
							dateStyle: "long",
							timeZone: "UTC",
						});
						return Util.escapeMarkdown(dateFormat.format(iosDate));
					},
				}),
				ephemeral: true,
			});
		} catch (error: unknown) {
			console.warn(error);
			const linkList: string = list(updates);
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
