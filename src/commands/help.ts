import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type Feed from "../feeds.js";
import type Grant from "../grants.js";
import type Trigger from "../triggers.js";
import type {Localized} from "../utils/string.js";
import * as commands from "../commands.js";
import * as feeds from "../feeds.js";
import * as grants from "../grants.js";
import * as triggers from "../triggers.js";
import {compileAll, composeAll, list, localize} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
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
		const {user}: CommandInteraction = interaction;
		const features: string[] = [
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
		].flat<(Grant | Command | Feed | Trigger)[][]>().map<string[]>((action: Grant | Command | Feed | Trigger): string[] => {
			const description: Localized<(groups: {}) => string> | null = action.describe(interaction);
			if (description == null) {
				return [];
			}
			return description["en-US"]({}).split("\n");
		}).flat<string[][]>();
		const featureList: string = list(features);
		await interaction.reply({
			content: `Hey ${user}, there you are!\nI can give you some advice about the server:\n${featureList}`,
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
