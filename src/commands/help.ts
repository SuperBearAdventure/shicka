import * as commands from "../commands.js";
import * as feeds from "../feeds.js";
import * as grants from "../grants.js";
import * as triggers from "../triggers.js";
const helpCommand = {
	register(name) {
		const description = "Tells you what are the features I offer";
		return {name, description};
	},
	async execute(interaction) {
		if (!interaction.isCommand()) {
			return;
		}
		const {user} = interaction;
		const featureList = [
			Object.keys(grants).map((grantName) => {
				const grant = grants[grantName];
				return [grantName, grant];
			}),
			Object.keys(commands).map((commandName) => {
				const command = commands[commandName];
				return [commandName, command];
			}),
			Object.keys(feeds).map((feedName) => {
				const feed = feeds[feedName];
				return [feedName, feed];
			}),
			Object.keys(triggers).map((triggerName) => {
				const trigger = triggers[triggerName];
				return [triggerName, trigger];
			}),
		].flat().map(([name, action]) => {
			const description = action.describe(interaction, name);
			if (description == null) {
				return [];
			}
			return description.split("\n");
		}).flat().map((description) => {
			return `\u{2022} ${description}`;
		}).join("\n");
		await interaction.reply(`Hey ${user}, there you are!\nI can give you some advice about the server:\n${featureList}`);
	},
	describe(interaction, name) {
		return `Type \`/${name}\` to know what are the features I offer`;
	},
};
export default helpCommand;
