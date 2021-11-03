import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionData,
	CommandInteraction,
	Interaction,
	ThreadChannel,
} from "discord.js";
import type {
	Canvas,
	Image,
	CanvasRenderingContext2D,
} from "canvas";
import type Command from "../commands.js";
import type {Locale, Localized} from "../utils/string.js";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import canvas from "canvas";
import {Util} from "discord.js";
import {JSDOM} from "jsdom";
import serialize from "w3c-xmlserializer";
import {compileAll, composeAll, localize, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
	baseOptionDescription: () => string,
	stylesOptionDescription: () => string,
};
type NoPrivacyReplyGroups = {};
type NoBaseReplyGroups = {
	baseConjunction: () => string,
};
type NoStyleReplyGroups = {
	styleConjunction: () => string,
};
const {createCanvas, loadImage}: any = canvas;
const here: string = import.meta.url;
const root: string = here.slice(0, here.lastIndexOf("/"));
const commandName: string = "emoji";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Creates a new emoji starting from this base and customized with these styles",
	"fr": "Crée un nouvel émoji à partir de cette base et personnalisé avec ces styles",
};
const commandDescription: string = "Creates a new emoji starting from this base and customized with these styles";
const baseOptionName: string = "base";
const baseOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some base",
	"fr": "Une base",
};
const baseOptionDescription: string = baseOptionDescriptionLocalizations["en-US"];
// const stylesOptionName: string = "styles";
const stylesOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some styles",
	"fr": "Des styles",
};
const stylesOptionDescription: string = stylesOptionDescriptionLocalizations["en-US"];
const bases: Set<string> = new Set(["baaren", "shicka", "baaren-outlined", "shicka-outlined", "baaren-discord", "shicka-discord"]);
const paints: Set<"fill" | "stroke"> = new Set(["fill", "stroke"]);
const layers: Set<"background" | "foreground" | "marker"> = new Set(["background", "foreground", "marker"]);
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
const channels: Set<string> = new Set<string>(["🔧│console", "🔎│logs", "🔰│helpers-room", "🛡│moderators-room", "🍪│cookie-room"]);
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName> $<baseOptionDescription> $<stylesOptionDescription>` to create a new `$<baseOptionDescription>`-based emoji customized with `$<stylesOptionDescription>`",
	"fr": "Tape `/$<commandName> $<baseOptionDescription> $<stylesOptionDescription>` pour créer un nouvel émoji basé sur `$<baseOptionDescription>` personnalisé avec `$<stylesOptionDescription>`",
});
const noPrivacyReplyLocalizations: Localized<(groups: NoPrivacyReplyGroups) => string> = compileAll<NoPrivacyReplyGroups>({
	"en-US": "I can not reply to you in this channel.\nPlease ask me in a private channel instead.",
	"fr": "Je ne peux pas te répondre dans ce salon.\nMerci de me demander dans un salon privé à la place.",
});
const noBaseReplyLocalizations: Localized<(groups: NoBaseReplyGroups) => string> = compileAll<NoBaseReplyGroups>({
	"en-US": "I do not know any base with this name.\nPlease give me a base among $<baseConjunction> instead.",
	"fr": "Je ne connais aucune base avec ce nom.\nMerci de me donner une base parmi $<baseConjunction> à la place.",
});
const noStyleReplyLocalizations: Localized<(groups: NoStyleReplyGroups) => string> = compileAll<NoStyleReplyGroups>({
	"en-US": "I do not know any style with this name.\nPlease give me a style among $<styleConjunction> instead.",
	"fr": "Je ne connais aucun style avec ce nom.\nMerci de me donner une style parmi $<styleConjunction> à la place.",
});
const emojiCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
			options: [
				{
					type: "STRING",
					name: baseOptionName,
					description: baseOptionDescription,
					descriptionLocalizations: baseOptionDescriptionLocalizations,
					required: true,
					choices: Array.from(bases, (base: string): ApplicationCommandOptionChoiceData => {
						return {
							name: base,
							value: base,
						};
					}),
				},
				...Array.from(paints, (paint: string): ApplicationCommandOptionData[] => {
					return Array.from(layers, (layer: string): ApplicationCommandOptionData => {
						const optionName: string = `${layer}-${paint}`;
						const optionDescription: string = stylesOptionDescription;
						const optionDescriptionLocalizations: Localized<string> = stylesOptionDescriptionLocalizations;
						return {
							type: "STRING",
							name: optionName,
							description: optionDescription,
							descriptionLocalizations: optionDescriptionLocalizations,
							choices: Object.keys(styles).map((style: string): ApplicationCommandOptionChoiceData => {
								return {
									name: style,
									value: style,
								};
							}),
						};
					});
				}).flat(),
			],
			defaultPermission: false,
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {channel, locale, options}: CommandInteraction = interaction;
		const resolvedLocale: Locale = resolve(locale);
		if (channel == null || !("name" in channel)) {
			await interaction.reply({
				content: noPrivacyReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		if (!channel.isThread() && !channels.has(channel.name)) {
			await interaction.reply({
				content: noPrivacyReplyLocalizations[resolvedLocale]({}),
				ephemeral: true,
			});
			return;
		}
		if (channel.isThread()) {
			const {parent}: ThreadChannel = channel;
			if (parent == null || !channels.has(parent.name)) {
				await interaction.reply({
					content: noPrivacyReplyLocalizations[resolvedLocale]({}),
					ephemeral: true,
				});
				return;
			}
		}
		const base: string = options.getString(baseOptionName, true);
		if (!bases.has(base)) {
			await interaction.reply({
				content: noBaseReplyLocalizations[resolvedLocale]({
					baseConjunction: (): string => {
						const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(resolvedLocale, {
							style: "long",
							type: "conjunction",
						});
						return conjunctionFormat.format(Array.from(bases).map((base: string): string => {
							return `\`${Util.escapeMarkdown(base)}\``;
						}));
					},
				}),
				ephemeral: true,
			});
			return;
		}
		const wrapper: Element = new JSDOM(`<div xmlns="http://www.w3.org/1999/xhtml">${await readFile(fileURLToPath(`${root}/../emojis/${base}.svg`))}</div>`, {
			contentType: "application/xhtml+xml",
		}).window.document.documentElement;
		const svg: Element | null = wrapper.firstElementChild;
		if (svg == null) {
			throw new Error();
		}
		const shapes: {[k in string]: SVGElement[]} = Object.assign(Object.create(null), Object.fromEntries(Array.from(layers, (key: string): [string, SVGElement[]] => {
			const value: SVGElement[] = [...svg.querySelectorAll<SVGElement>(`.${key}`)];
			return [key, value];
		})));
		for (const paint of paints) {
			for (const layer of layers) {
				const style: string | null = options.getString(`${layer}-${paint}`);
				if (style == null) {
					continue;
				}
				if (!(style in styles)) {
					await interaction.reply({
						content: noStyleReplyLocalizations[resolvedLocale]({
							styleConjunction: (): string => {
								const conjunctionFormat: Intl.ListFormat = new Intl.ListFormat(resolvedLocale, {
									style: "long",
									type: "conjunction",
								});
								return conjunctionFormat.format(Object.keys(styles).map((style: string): string => {
									return `\`${Util.escapeMarkdown(style)}\``;
								}));
							},
						}),
						ephemeral: true,
					});
					return;
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
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
		const {channel}: CommandInteraction = interaction;
		if (channel == null || !("name" in channel) || !channels.has(channel.name)) {
			return null;
		}
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
				baseOptionDescription: (): string => {
					return baseOptionDescriptionLocalizations[locale];
				},
				stylesOptionDescription: (): string => {
					return stylesOptionDescriptionLocalizations[locale];
				},
			};
		}));
	},
};
export default emojiCommand;
