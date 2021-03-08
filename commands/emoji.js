import url from "url";
import fs from "fs";
import canvas from "canvas";
import discord from "discord.js";
import jsdom from "jsdom";
import serialize from "w3c-xmlserializer";
import Command from "../command.js";
const {fileURLToPath} = url;
const {readFile} = fs.promises;
const {createCanvas, loadImage} = canvas;
const {MessageAttachment, Util} = discord;
const {JSDOM} = jsdom;
const here = import.meta.url;
const root = here.slice(0, here.lastIndexOf("/"));
const bases = new Set(["baaren", "shicka"]);
const styles = Object.assign(Object.create(null), {
	"dark-gold": "url(\"#dark-gold\")",
	"light-gold": "url(\"#light-gold\")",
	"dark-silver": "url(\"#dark-silver\")",
	"light-silver": "url(\"#light-silver\")",
	"dark-bronze": "url(\"#dark-bronze\")",
	"light-bronze": "url(\"#light-bronze\")",
	"dark-gray": "#111",
	"light-gray": "#eee",
	"black": "#000",
	"white": "#fff",
	"none": "none",
});
const channels = new Set(["bot", "moderation", "🍪cookie-room"]);
export default class EmojiCommand extends Command {
	async execute(message, parameters) {
		if (!channels.has(message.channel.name)) {
			return;
		}
		if (parameters.length < 2) {
			const choice = Object.keys(styles).concat("auto").map((style) => {
				return `- \`${Util.escapeMarkdown(style)}\``;
			}).join("\n");
			await message.channel.send(`Please give me a base and up to 6 styles among:\n${choice}`);
			return;
		}
		const base = parameters[1].toLowerCase();
		if (!bases.has(base)) {
			await message.channel.send(`I do not know any base with this name.`);
			return;
		}
		const wrapper = new JSDOM(`<div xmlns="http://www.w3.org/1999/xhtml">${await readFile(fileURLToPath(`${root}/../emojis/${base}.svg`))}</div>`, {
			contentType: "image/svg+xml",
		}).window.document.documentElement;
		const svg = wrapper.firstElementChild;
		const shapes = svg.querySelectorAll("path, polygon");
		let index = 2;
		loop: for (const paint of ["fill", "stroke"]) {
			for (const shape of shapes) {
				if (parameters.length <= index) {
					break loop;
				}
				const parameter = parameters[index].toLowerCase();
				if (parameter in styles) {
					shape.style[paint] = styles[parameter];
				}
				++index;
			}
		}
		const url = `data:image/svg+xml;charset=utf-8,${serialize(wrapper).slice(42, -6)}`;
		const image = await loadImage(url);
		const canvas = createCanvas(192, 192);
		const context = canvas.getContext("2d");
		context.drawImage(image, 0, 0, 192, 192);
		const attachment = new MessageAttachment(canvas.toBuffer(), `${base}.png`);
		await message.channel.send(attachment);
	}
	async describe(message, command) {
		if (!channels.has(message.channel.name)) {
			return "";
		}
		return `Type \`${command} Baaren Some styles\` to create a new bear-based emoji customized with \`Some styles\`\nType \`${command} Shicka Some styles\` to create a new backpacker-based emoji customized with \`Some styles\``;
	}
}
