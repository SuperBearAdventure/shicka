import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
	User,
} from "discord.js";
import type Command from "../commands.js";
import type Feed from "../feeds.js";
import type Grant from "../grants.js";
import type Trigger from "../triggers.js";
import type {Locale, Localized} from "../utils/string.js";
import * as commands from "../commands.js";
import * as feeds from "../feeds.js";
import * as grants from "../grants.js";
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
			Object.keys(grants).map<Grant>((grantName: string): Grant => {
				const grant: Grant = grants[grantName as keyof typeof grants] as Grant;
				return grant;
			}),
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
		].flat<(Grant | Command | Feed | Trigger)[][]>().map<Localized<(groups: {}) => string> | null>((action: Grant | Command | Feed | Trigger): Localized<(groups: {}) => string> | null => {
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
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				user: (): string => {
					return `${user}`;
				},
				featureList: (): string => {
					return list(features["en-US"]({}));
				},
			}),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: replyLocalizations[resolvedLocale]({
				user: (): string => {
					return `${user}`;
				},
				featureList: (): string => {
					return list(features[resolvedLocale]({}));
				},
			}),
			ephemeral: true,
		});
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
