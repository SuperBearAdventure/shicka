import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
	User,
} from "discord.js";
import type Command from "../commands.js";
import type Feed from "../feeds.js";
import type Trigger from "../triggers.js";
import type {Locale, Localized} from "../utils/string.js";
import * as commands from "../commands.js";
import * as feeds from "../feeds.js";
import * as triggers from "../triggers.js";
import {compileAll, composeAll, list, localize, resolve} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
};
type ReplyGroups = {
	user: () => string,
	featureList: () => string,
};
const commandName: string = "help";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you what are the features I offer",
	"fr": "Te dit quelles sont les fonctionnalités que je propose",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know what are the features I offer",
	"fr": "Tape `/$<commandName>` pour savoir quelles sont les fonctionnalités que je propose",
});
const replyLocalizations: Localized<(groups: ReplyGroups) => string> = compileAll<ReplyGroups>({
	"en-US": "Hey $<user>, there you are!\nI can give you some advice about the server:\n$<featureList>",
	"fr": "Ah $<user>, tu es là !\nJe peux te donner des conseils sur le serveur :\n$<featureList>",
});
function naiveStream(content: string): string[] {
	content = content.replace(/^\n+|\n+$/g, "").replace(/\n+/g, "\n");
	if (content.length === 0) {
		return [];
	}
	if (content[content.length - 1] !== "\n") {
		content = `${content}\n`;
	}
	const lines: string[] = content.split(/(?<=\n)/);
	const chunks: string[] = [];
	const chunk: string[] = [];
	let length: number = 0;
	for (const line of lines) {
		if (length > 0 && length + line.length > 2000) {
			chunks.push(chunk.join(""));
			chunk.length = 0;
			length = 0;
		}
		const spans: string[] = line.slice(0, -1).match(/[^]{1,1999}/g) ?? [];
		const firstSpans: string[] = spans.slice(0, -1);
		for (const span of firstSpans) {
			chunks.push(`${span}\n`);
		}
		const lastSpan: string = spans[spans.length - 1];
		chunk.push(`${lastSpan}\n`);
		length += lastSpan.length + 1;
	}
	if (length > 0) {
		chunks.push(chunk.join(""));
	}
	return chunks;
}
const helpCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {locale, user}: CommandInteraction = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const descriptions: Localized<(groups: {}) => string>[] = [
			Object.keys(commands).map<Command>((commandName: string): Command => {
				const command: Command = commands[commandName as keyof typeof commands] as Command;
				return command;
			}),
			Object.keys(feeds).map<Feed>((feedName: string): Feed => {
				const feed: Feed = feeds[feedName as keyof typeof feeds] as Feed;
				return feed;
			}),
			Object.keys(triggers).map<Trigger>((triggerName: string): Trigger => {
				const trigger: Trigger = triggers[triggerName as keyof typeof triggers] as Trigger;
				return trigger;
			}),
		].flat<(Command | Feed | Trigger)[][]>().map<Localized<(groups: {}) => string> | null>((action: Command | Feed | Trigger): Localized<(groups: {}) => string> | null => {
			const description: Localized<(groups: {}) => string> | null = action.describe(interaction);
			return description;
		}).filter<Localized<(groups: {}) => string>>((description: Localized<(groups: {}) => string> | null): description is Localized<(groups: {}) => string> => {
			return description != null;
		});
		const features: Localized<(groups: {}) => string[]> = localize<(groups: {}) => string[]>((locale: Locale): (groups: {}) => string[] => {
			return (groups: {}): string[] => {
				return descriptions.map((description: Localized<(groups: {}) => string>): string[] => {
					return description[locale](groups).split("\n");
				}).flat<string[][]>();
			};
		});
		const persistentContent: string = replyLocalizations["en-US"]({
			user: (): string => {
				return `${user}`;
			},
			featureList: (): string => {
				return list(features["en-US"]({}));
			},
		});
		const persistentContentChunks: string[] = naiveStream(persistentContent);
		let replied: boolean = false;
		for (const chunk of persistentContentChunks) {
			if (!replied) {
				await interaction.reply({
					content: chunk,
					allowedMentions: {
						users: [],
					},
				});
				replied = true;
				continue;
			}
			await interaction.followUp({
				content: chunk,
				allowedMentions: {
					users: [],
				},
			});
		}
		if (resolvedLocale === "en-US") {
			return;
		}
		const ephemeralContent: string = replyLocalizations[resolvedLocale]({
			user: (): string => {
				return `${user}`;
			},
			featureList: (): string => {
				return list(features[resolvedLocale]({}));
			},
		});
		const ephemeralContentChunks: string[] = naiveStream(ephemeralContent);
		for (const chunk of ephemeralContentChunks) {
			if (!replied) {
				await interaction.reply({
					content: chunk,
					ephemeral: true,
					allowedMentions: {
						users: [],
					},
				});
				replied = true;
				continue;
			}
			await interaction.followUp({
				content: chunk,
				ephemeral: true,
				allowedMentions: {
					users: [],
				},
			});
		}
	},
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
			};
		}));
	},
};
export default helpCommand;
