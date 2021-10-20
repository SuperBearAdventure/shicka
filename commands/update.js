import discord from "discord.js";
import fetch from "node-fetch";
import jsdom from "jsdom";
import Command from "../command.js";
const {Util} = discord;
const {JSDOM} = jsdom;
const dateFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeZone: "UTC",
});
export default class UpdateCommand extends Command {
	async execute(interaction) {
		try {
			const {window} = await JSDOM.fromURL("https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer");
			const versionElement = window.document.querySelector(".IxB2fe > :nth-child(4) > :nth-child(2) > :nth-child(1) > :nth-child(1)");
			if (versionElement === null) {
				throw new Error("No version found");
			}
			const dateElement = window.document.querySelector(".IxB2fe > :nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(1)");
			if (dateElement === null) {
				throw new Error("No date found");
			}
			const response = await fetch("https://itunes.apple.com/lookup?id=1531842415&entity=software");
			const {results} = await response.json();
			if (results.length === 0) {
				throw new Error("No result found");
			}
			const result = results[0];
			const androidVersion = versionElement.textContent;
			const androidDate = dateElement.textContent;
			const iosVersion = result.version;
			const iosDate = dateFormat.format(new Date(result.currentVersionReleaseDate));
			await interaction.reply(`The latest update of the game is:\n- **${Util.escapeMarkdown(androidVersion)}** on **Android** (*${Util.escapeMarkdown(androidDate)}*)\n- **${Util.escapeMarkdown(iosVersion)}** on **iOS** (*${Util.escapeMarkdown(iosDate)}*)`);
		} catch (error) {
			console.warn(error);
			await (await interaction.reply({
				content: "You can check and download the latest update of the game there:\n- *Android*: https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer\n- *iOS*: https://apps.apple.com/app/id1531842415",
				fetchReply: true,
			})).suppressEmbeds(true);
		}
	}
	describe(interaction, name) {
		const description = `Type \`/${name}\` to check the latest update of the game`;
		return {name, description};
	}
}
