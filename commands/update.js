import discord from "discord.js";
import jsdom from "jsdom";
import Command from "../command.js";
const {Util} = discord;
const {JSDOM} = jsdom;
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
			const version = `**${Util.escapeMarkdown(versionElement.textContent)}**`;
			const date = `*${Util.escapeMarkdown(dateElement.textContent)}*`;
			await message.channel.send(`The latest update of the game is ${version} (${date}).`);
		} catch (error) {
			console.warn(error);
			await message.channel.send("You can check and download the latest update of the game there:\nhttps://play.google.com/store/apps/details?id=com.Earthkwak.Platformer");
		}
	}
	async describe(message, command) {
		return `Type \`${command}\` to check the latest update of the game`;
	}
}
