import Command from "../command.js";
export default class HelpCommand extends Command {
	async execute(interaction) {
		const {client, user} = interaction;
		const {commands, feeds, grants, triggers} = client;
		const featureList = [
			Object.entries(grants),
			Object.entries(commands),
			Object.entries(feeds),
			Object.entries(triggers),
		].flat().map(([name, action]) => {
			const {description} = action.describe(interaction, name);
			if (description === null) {
				return [];
			}
			return description.split("\n");
		}).flat().map((description) => {
			return `- ${description}`;
		}).join("\n");
		await interaction.reply(`Hey ${user}, there you are!\nI can give you some advice about the server:\n${featureList}`);
	}
	describe(interaction, name) {
		const description = `Type \`/${name}\` to know the features I offer`;
		return {name, description};
	}
}
