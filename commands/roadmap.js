import Command from "../command.js";
export default class RoadmapCommand extends Command {
	register(client, name) {
		const description = "Tells you where to check the upcoming milestones of the game";
		return {name, description};
	}
	async execute(interaction) {
		const channel = interaction.guild.channels.cache.find((channel) => {
			return channel.name === "💡・game-suggestions";
		});
		const intent = channel != null ? `Before suggesting an idea in ${channel},` : "You can";
		await (await interaction.reply({
			content: `${intent} check the upcoming milestones of the game there:\nhttps://trello.com/b/3DPL9CwV/road-to-100`,
			fetchReply: true,
		})).suppressEmbeds(true);
	}
	describe(interaction, name) {
		return `Type \`/${name}\` to know where to check the upcoming milestones of the game`;
	}
}
