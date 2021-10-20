import fs from "node:fs/promises";
import url from "node:url";
import canvas from "canvas";
import discord from "discord.js";
import jsdom from "jsdom";
import serialize from "w3c-xmlserializer";
import Grant from "../grant.js";
const {readFile} = fs;
const {fileURLToPath} = url;
const {createCanvas, loadImage} = canvas;
const {Util} = discord;
const {JSDOM} = jsdom;
const here = import.meta.url;
const root = here.slice(0, here.lastIndexOf("/"));
const conjunctionFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
const bases = new Set(["baaren", "shicka", "baaren-outlined", "shicka-outlined", "baaren-discord", "shicka-discord"]);
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
const channels = new Set(["🔎logs", "🛡moderators-room", "🍪cookie-room"]);
export default class EmojiGrant extends Grant {
	async execute(message, parameters) {
		if (!channels.has(message.channel.name)) {
			return;
		}
		if (parameters.length < 2) {
			const baseConjunction = conjunctionFormat.format(Array.from(bases.keys()).map((base) => {
				return `\`${Util.escapeMarkdown(base)}\``;
			}));
			const styleConjunction = conjunctionFormat.format(Object.keys(styles).concat("auto").map((style) => {
				return `\`${Util.escapeMarkdown(style)}\``;
			}));
			await message.channel.send(`Please give me:\n- a base among ${baseConjunction}\n- up to 6 styles among ${styleConjunction}`);
			return;
		}
		const base = parameters[1].toLowerCase();
		if (!bases.has(base)) {
			await message.channel.send(`I do not know any base with this name.`);
			return;
		}
		const wrapper = new JSDOM(`<div xmlns="http://www.w3.org/1999/xhtml">${await readFile(fileURLToPath(`${root}/../emojis/${base}.svg`))}</div>`, {
			contentType: "application/xhtml+xml",
		}).window.document.documentElement;
		const svg = wrapper.firstElementChild;
		const groups = [".background", ".foreground", ".marker"].map((selector) => {
			return svg.querySelectorAll(selector);
		});
		let index = 2;
		loop: for (const paint of ["fill", "stroke"]) {
			for (const group of groups) {
				if (parameters.length <= index) {
					break loop;
				}
				const parameter = parameters[index].toLowerCase();
				if (parameter in styles) {
					for (const shape of group) {
						if (shape.style[paint] === "") {
							shape.style[paint] = styles[parameter];
						}
					}
				}
				++index;
			}
		}
		const zoom = 2;
		const width = Number(svg.getAttribute("width")) * zoom;
		const height = Number(svg.getAttribute("height")) * zoom;
		svg.setAttribute("width", width);
		svg.setAttribute("height", height);
		const url = `data:image/svg+xml;charset=utf-8,${serialize(wrapper, {
			requireWellFormed: true,
		}).slice(42, -6)}`;
		const image = await loadImage(url);
		const canvas = createCanvas(width, height);
		const context = canvas.getContext("2d");
		context.drawImage(image, 0, 0, width, height);
		await message.reply({
			files: [
				{
					attachment: canvas.toBuffer(),
					name: `${base}.png`,
				},
			],
		});
	}
	describe(interaction, name) {
		return channels.has(interaction.channel.name) ? `Type \`/${name} Some base Some styles\` to create a new \`Some base\`-based emoji customized with \`Some styles\`` : null;
	}
}
