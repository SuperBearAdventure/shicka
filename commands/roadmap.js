import Command from "../command.js";
export default class RoadmapCommand extends Command {
	async execute(message, parameters) {
		const channel = message.guild.channels.cache.find((channel) => {
			return channel.name === "🤔suggestions";
		});
		if (typeof channel !== "undefined") {
			await (await message.reply(`Before suggesting an idea in ${channel}, check the upcoming milestones of the game there:\nhttps://trello.com/b/3DPL9CwV/road-to-100`)).suppressEmbeds(true);
			return;
		}
		await (await message.reply("You can check the upcoming milestones of the game there:\nhttps://trello.com/b/3DPL9CwV/road-to-100")).suppressEmbeds(true);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know where to check the upcoming milestones of the game`;
	}
}
