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
const helpCommand: Command = {
	register(name: string): ApplicationCommandData {
		const description: string = "Tells you what are the features I offer";
		return {name, description};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {user}: CommandInteraction = interaction;
		const featureList: string = [
			Object.keys(grants).map((grantName: string): [string, Grant] => {
				const grant: Grant = grants[grantName as keyof typeof grants] as Grant;
				return [grantName, grant];
			}),
			Object.keys(commands).map((commandName: string): [string, Command] => {
				const command: Command = commands[commandName as keyof typeof commands] as Command;
				return [commandName, command];
			}),
			Object.keys(feeds).map((feedName: string): [string, Feed] => {
				const feed: Feed = feeds[feedName as keyof typeof feeds] as Feed;
				return [feedName, feed];
			}),
			Object.keys(triggers).map((triggerName: string): [string, Trigger] => {
				const trigger: Trigger = triggers[triggerName as keyof typeof triggers] as Trigger;
				return [triggerName, trigger];
			}),
		].flat().map(([name, action]: [string, Grant | Command | Feed | Trigger]): string[] => {
			const description: string | null = action.describe(interaction, name);
			if (description == null) {
				return [];
			}
			return description.split("\n");
		}).flat().map((description: string): string => {
			return `\u{2022} ${description}`;
		}).join("\n");
		await interaction.reply(`Hey ${user}, there you are!\nI can give you some advice about the server:\n${featureList}`);
	},
	describe(interaction: CommandInteraction, name: string): string | null {
		return `Type \`/${name}\` to know what are the features I offer`;
	},
};
export default helpCommand;
