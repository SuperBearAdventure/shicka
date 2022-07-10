import type {
	CommandInteraction,
	Message,
} from "discord.js";
import type {
	Canvas,
	Image,
	CanvasRenderingContext2D,
} from "canvas";
import type Grant from "../grants.js";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import canvas from "canvas";
import {Util} from "discord.js";
import {JSDOM} from "jsdom";
import serialize from "w3c-xmlserializer";
const {createCanvas, loadImage}: any = canvas;
const here: string = import.meta.url;
const root: string = here.slice(0, here.lastIndexOf("/"));
const grantName: string = "emoji";
const baseArgumentDescription: string = "Some base";
const stylesArgumentDescription: string = "Some styles";
const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat("en-US", {
	style: "long",
	type: "conjunction",
});
const bases: Set<string> = new Set(["baaren", "shicka", "baaren-outlined", "shicka-outlined", "baaren-discord", "shicka-discord"]);
const styles: {[k in string]: string} = Object.assign(Object.create(null), {
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
const channels: Set<string> = new Set(["🔧・console", "🔎・logs", "🛡・moderators-room", "🍪・cookie-room"]);
const emojiGrant: Grant = {
	async execute(message: Message, parameters: string[], tokens: string[]): Promise<void> {
		const {channel}: Message = message;
		if (!("name" in channel) || !channels.has(channel.name)) {
			return;
		}
		if (parameters.length < 2) {
			const baseConjunction: string = conjunctionFormat.format(Array.from(bases.keys()).map((base: string): string => {
				return `\`${Util.escapeMarkdown(base)}\``;
			}));
			const styleConjunction: string = conjunctionFormat.format(Object.keys(styles).concat("auto").map((style: string): string => {
				return `\`${Util.escapeMarkdown(style)}\``;
			}));
			await message.channel.send(`Please give me:\n\u{2022} a base among ${baseConjunction}\n\u{2022} up to 6 styles among ${styleConjunction}`);
			return;
		}
		const base: string = parameters[1].toLowerCase();
		if (!bases.has(base)) {
			await message.channel.send(`I do not know any base with this name.`);
			return;
		}
		const wrapper: Element = new JSDOM(`<div xmlns="http://www.w3.org/1999/xhtml">${await readFile(fileURLToPath(`${root}/../emojis/${base}.svg`))}</div>`, {
			contentType: "application/xhtml+xml",
		}).window.document.documentElement;
		const svg: Element | null = wrapper.firstElementChild;
		if (svg == null) {
			throw new Error();
		}
		const groups: SVGElement[][] = [".background", ".foreground", ".marker"].map((selector: string): SVGElement[] => {
			return [...svg.querySelectorAll<SVGElement>(selector)];
		});
		let index: number = 2;
		loop: for (const paint of ["fill", "stroke"] as const) {
			for (const group of groups) {
				if (parameters.length <= index) {
					break loop;
				}
				const parameter: string = parameters[index].toLowerCase();
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
		const zoom: number = 2;
		const width: number  = Number(svg.getAttribute("width")) * zoom;
		const height: number  = Number(svg.getAttribute("height")) * zoom;
		svg.setAttribute("width", `${width}`);
		svg.setAttribute("height", `${height}`);
		const url: string = `data:image/svg+xml;charset=utf-8,${serialize(wrapper, {
			requireWellFormed: true,
		}).slice(42, -6)}`;
		const image: Image = await loadImage(url);
		const canvas: Canvas = createCanvas(width, height);
		const context: CanvasRenderingContext2D = canvas.getContext("2d");
		context.drawImage(image, 0, 0, width, height);
		await message.reply({
			files: [
				{
					attachment: canvas.toBuffer(),
					name: `${base}.png`,
				},
			],
		});
	},
	describe(interaction: CommandInteraction): string | null {
		const {channel}: CommandInteraction = interaction;
		if (channel == null || !("name" in channel) || !channels.has(channel.name)) {
			return null;
		}
		return `Type \`/${grantName} ${baseArgumentDescription} ${stylesArgumentDescription}\` to create a new \`${baseArgumentDescription}\`-based emoji customized with \`${stylesArgumentDescription}\``;
	},
};
export default emojiGrant;
