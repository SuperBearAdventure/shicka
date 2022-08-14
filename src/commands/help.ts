import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type Feed from "../feeds.js";
import type Grant from "../grants.js";
import type Trigger from "../triggers.js";
import * as commands from "../commands.js";
import * as feeds from "../feeds.js";
import * as grants from "../grants.js";
import * as triggers from "../triggers.js";
const commandName: string = "help";
const commandDescription: string = "Tells you what are the features I offer";
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandName}\` to know what are the features I offer`;
		},
	});
}
const helpCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {user}: CommandInteraction = interaction;
		const featureList: string = [
			Object.keys(grants).map((grantName: string): Grant => {
				const grant: Grant = grants[grantName as keyof typeof grants] as Grant;
				return grant;
			}),
			Object.keys(commands).map((commandName: string): Command => {
				const command: Command = commands[commandName as keyof typeof commands] as Command;
				return command;
			}),
			Object.keys(feeds).map((feedName: string): Feed => {
				const feed: Feed = feeds[feedName as keyof typeof feeds] as Feed;
				return feed;
			}),
			Object.keys(triggers).map((triggerName: string): Trigger => {
				const trigger: Trigger = triggers[triggerName as keyof typeof triggers] as Trigger;
				return trigger;
			}),
		].flat().map((action: Grant | Command | Feed | Trigger): string[] => {
			const description: (() => string) | null = action.describe(interaction)["en-US"];
			if (description == null) {
				return [];
			}
			return description().split("\n");
		}).flat().map((description: string): string => {
			return `\u{2022} ${description}`;
		}).join("\n");
		await interaction.reply(`Hey ${user}, there you are!\nI can give you some advice about the server:\n${featureList}`);
	},
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		return computeHelpLocalizations();
	},
};
export default helpCommand;
