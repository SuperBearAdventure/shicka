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
	async execute(message, parameters) {
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
			const {resultCount, results} = await response.json();
			if (resultCount === 0) {
				throw new Error("No result found");
			}
			const result = results[0];
			const androidVersion = `**${Util.escapeMarkdown(versionElement.textContent)}**`;
			const androidDate = `*${Util.escapeMarkdown(dateElement.textContent)}*`;
			const iosVersion = `**${Util.escapeMarkdown(result.version)}**`;
			const iosDate = `*${Util.escapeMarkdown(dateFormat.format(new Date (result.currentVersionReleaseDate)))}*`;
			await message.channel.send(`The latest update of the game is :\n- ${androidVersion} (${androidDate}) on Android\n- ${iosVersion} (${iosDate}) on iOS`);
		} catch (error) {
			console.warn(error);
			await message.channel.send("You can check and download the latest update of the game there:\n- https://play.google.com/store/apps/details?id=com.Earthkwak.Platformer (Android)\n- https://apps.apple.com/app/id1531842415 (iOS)");
		}
	}
	async describe(message, command) {
		return `Type \`${command}\` to check the latest update of the game`;
	}
}
