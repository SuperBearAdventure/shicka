import type {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionData,
	ChatInputCommandInteraction,
} from "discord.js";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";
import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Emoji as EmojiCompilation} from "../compilations.js";
import type {Emoji as EmojiDefinition} from "../definitions.js";
import type {Emoji as EmojiDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {
	ApplicationCommandOptionType,
} from "discord.js";
import canvas from "canvas";
import {JSDOM} from "jsdom";
import serialize from "w3c-xmlserializer";
import {emoji as emojiCompilation} from "../compilations.js";
import {emoji as emojiDefinition} from "../definitions.js";
import {composeAll, localize} from "../utils/string.js";
type HelpGroups = EmojiDependency["help"];
const {
	commandName,
	commandDescription,
	baseOptionName,
	baseOptionDescription,
	// stylesOptionName,
	stylesOptionDescription,
}: EmojiDefinition = emojiDefinition;
const {
	help: helpLocalizations,
}: EmojiCompilation = emojiCompilation;
const {createCanvas, loadImage}: any = canvas;
const here: string = import.meta.url;
const root: string = here.slice(0, here.lastIndexOf("/"));
const bases: Set<"baaren" | "shicka" | "baaren-outlined" | "shicka-outlined" | "baaren-discord" | "shicka-discord" | "baaren-pixel" | "shicka-pixel"> = new Set<"baaren" | "shicka" | "baaren-outlined" | "shicka-outlined" | "baaren-discord" | "shicka-discord" | "baaren-pixel" | "shicka-pixel">(["baaren", "shicka", "baaren-outlined", "shicka-outlined", "baaren-discord", "shicka-discord", "baaren-pixel", "shicka-pixel"]);
const paints: Set<"fill" | "stroke"> = new Set<"fill" | "stroke">(["fill", "stroke"]);
const layers: Set<"background" | "foreground" | "marker"> = new Set<"background" | "foreground" | "marker">(["background", "foreground", "marker"]);
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
const emojiCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: baseOptionName,
					description: baseOptionDescription["en-US"],
					descriptionLocalizations: baseOptionDescription,
					required: true,
					choices: Array.from<string, ApplicationCommandOptionChoiceData<string>>(bases, (base: string): ApplicationCommandOptionChoiceData<string> => {
						return {
							name: base,
							value: base,
						};
					}),
				},
				...Array.from<string, ApplicationCommandOptionData[]>(paints, (paint: string): ApplicationCommandOptionData[] => {
					return Array.from<string, ApplicationCommandOptionData>(layers, (layer: string): ApplicationCommandOptionData => {
						const optionName: string = `${layer}-${paint}`;
						const optionDescription: Localized<string> = stylesOptionDescription;
						return {
							type: ApplicationCommandOptionType.String,
							name: optionName,
							description: optionDescription["en-US"],
							descriptionLocalizations: optionDescription,
							choices: Object.keys(styles).map<ApplicationCommandOptionChoiceData<string>>((style: string): ApplicationCommandOptionChoiceData<string> => {
								return {
									name: style,
									value: style,
								};
							}),
						};
					});
				}).flat<ApplicationCommandOptionData[][]>(),
			],
			defaultMemberPermissions: [],
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		const {options}: ChatInputCommandInteraction<"cached"> = interaction;
		const base: string = options.getString(baseOptionName, true);
		const wrapper: Element = new JSDOM(`<div xmlns="http://www.w3.org/1999/xhtml">${await readFile(fileURLToPath(`${root}/../emojis/${base}.svg`))}</div>`, {
			contentType: "application/xhtml+xml",
		}).window.document.documentElement;
		const svg: Element | null = wrapper.firstElementChild;
		if (svg == null) {
			throw new Error();
		}
		const shapes: {[k in string]: SVGElement[]} = Object.assign(Object.create(null), Object.fromEntries(Array.from<string, [string, SVGElement[]]>(layers, (key: string): [string, SVGElement[]] => {
			const value: SVGElement[] = [...svg.querySelectorAll<SVGElement>(`.${key}`)];
			return [key, value];
		})));
		for (const paint of paints) {
			for (const layer of layers) {
				const style: string | null = options.getString(`${layer}-${paint}`);
				if (style == null) {
					continue;
				}
				for (const shape of shapes[layer]) {
					if (shape.style[paint] === "") {
						shape.style[paint] = styles[style];
					}
				}
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
		await interaction.reply({
			files: [
				{
					attachment: canvas.toBuffer(),
					name: `${base}.png`,
				},
			],
		});
	},
	describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				commandMention: (): string => {
					return `</${commandName}:${applicationCommand.id}>`;
				},
				baseOptionDescription: (): string => {
					return baseOptionDescription[locale];
				},
				stylesOptionDescription: (): string => {
					return stylesOptionDescription[locale];
				},
			};
		}));
	},
};
export default emojiCommand;
