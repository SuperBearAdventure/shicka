import {Util} from "discord.js";
import {JSDOM} from "jsdom";
import fetch from "node-fetch";
const dateFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeZone: "UTC",
});
const updateCommand = {
	register(name) {
		const description = "Tells you what is the latest update of the game";
		return {name, description};
	},
	async execute(interaction) {
		if (!interaction.isCommand()) {
			return;
		}
		try {
			const androidData = await (async () => {
				const {window} = await JSDOM.fromURL("https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer");
				const scripts = [...window.document.querySelectorAll("body > script")];
				for (const {textContent} of scripts) {
					if (textContent == null || !textContent.startsWith("AF_initDataCallback({") || !textContent.endsWith("});")) {
						continue;
					}
					try {
						const result = JSON.parse(textContent.slice(textContent.indexOf(", data:") + 7, textContent.lastIndexOf(", sideChannel: ")));
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
			const iosData = await (async () => {
				const response = await fetch("https://itunes.apple.com/lookup?id=1531842415&entity=software");
				const data = await response.json();
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
			const androidVersion = androidData.version;
			const androidDate = dateFormat.format(new Date(androidData.date));
			const iosVersion = iosData.version;
			const iosDate = dateFormat.format(new Date(iosData.date));
			await interaction.reply(`The latest update of the game is:\n\u{2022} **${Util.escapeMarkdown(androidVersion)}** on **Android** (*${Util.escapeMarkdown(androidDate)}*)\n\u{2022} **${Util.escapeMarkdown(iosVersion)}** on **iOS** (*${Util.escapeMarkdown(iosDate)}*)`);
		} catch (error) {
			console.warn(error);
			await interaction.reply({
				content: "You can check and download the latest update of the game there:\n\u{2022} [*Android*](<https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer>)\n\u{2022} [*iOS*](<https://apps.apple.com/app/id1531842415>)",
			});
		}
	},
	describe(interaction, name) {
		return `Type \`/${name}\` to know what is the latest update of the game`;
	},
};
export default updateCommand;
