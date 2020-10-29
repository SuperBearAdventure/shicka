import Command from "../command.js";
export default class TrackerCommand extends Command {
	async execute(message, parameters) {
		const channel = message.guild.channels.cache.find((channel) => {
			return channel.name === "🤔suggestions";
		});
		if (typeof channel !== "undefined") {
			await message.channel.send(`Before posting a suggestion in ${channel}, check the upcoming milestones of the game there:\nhttps://frama.link/sba-beta`);
			return;
		}
		await message.channel.send("You can check the upcoming milestones of the game there:\nhttps://frama.link/sba-beta");
	}
	async describe(message, command) {
		return `Type \`${command}\` to know what the upcoming milestones of the game are`;
	}
}
