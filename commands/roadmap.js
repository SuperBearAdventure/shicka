import Command from "../command.js";
export default class RoadmapCommand extends Command {
	register(client, name) {
		const description = "Tells you where to check the upcoming milestones of the game";
		return {name, description};
	}
	async execute(interaction) {
		const channel = interaction.guild.channels.cache.find((channel) => {
			return channel.name === "🤔suggestions";
		});
		if (typeof channel !== "undefined") {
			await (await interaction.reply({
				content: `Before suggesting an idea in ${channel}, check the upcoming milestones of the game there:\nhttps://trello.com/b/3DPL9CwV/road-to-100`,
				fetchReply: true,
			})).suppressEmbeds(true);
			return;
		}
		await (await interaction.reply({
			content: "You can check the upcoming milestones of the game there:\nhttps://trello.com/b/3DPL9CwV/road-to-100",
			fetchReply: true,
		})).suppressEmbeds(true);
	}
	describe(interaction, name) {
		return `Type \`/${name}\` to know where to check the upcoming milestones of the game`;
	}
}
