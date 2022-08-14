import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type {Response} from "node-fetch";
import type Command from "../commands.js";
import {Util} from "discord.js";
import {JSDOM} from "jsdom";
import fetch from "node-fetch";
type Data = {
	version: string,
	date: number,
};
const commandName: string = "update";
const commandDescription: string = "Tells you what is the latest update of the game";
const dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeZone: "UTC",
});
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandName}\` to know what is the latest update of the game`;
		},
		"fr"(): string {
			return `Tape \`/${commandName}\` pour savoir quelle est la dernière mise à jour du jeu`;
		},
	});
}
const updateCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
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
			const androidDate: string = dateFormat.format(new Date(androidData.date));
			const iosVersion: string = iosData.version;
			const iosDate: string = dateFormat.format(new Date(iosData.date));
			await interaction.reply(`The latest update of the game is:\n\u{2022} **${Util.escapeMarkdown(androidVersion)}** on **Android** (*${Util.escapeMarkdown(androidDate)}*)\n\u{2022} **${Util.escapeMarkdown(iosVersion)}** on **iOS** (*${Util.escapeMarkdown(iosDate)}*)`);
		} catch (error: unknown) {
			console.warn(error);
			await interaction.reply({
				content: "You can check and download the latest update of the game there:\n\u{2022} [*Android*](<https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer>)\n\u{2022} [*iOS*](<https://apps.apple.com/app/id1531842415>)",
			});
		}
	},
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		return computeHelpLocalizations();
	},
};
export default updateCommand;
