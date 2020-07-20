import discord from "discord.js";
import jsdom from "jsdom";
import {Command} from "./command.js";
const {Util} = discord;
const {JSDOM} = jsdom;
const pattern = /^!update *$/isu;
async function execute(message) {
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
		await message.channel.send(`The last update of the game is ${version} (${date}).`);
	} catch (error) {
		console.warn(error);
		await message.channel.send("You can check and download the latest update of the game here:\nhttps://play.google.com/store/apps/details?id=com.Earthkwak.Platformer");
	}
}
export class UpdateCommand extends Command {
	constructor() {
		super(pattern, execute);
	}
}
