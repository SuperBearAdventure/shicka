import Command from "../command.js";
export default class TrackerCommand extends Command {
	async execute(message, parameters) {
		const channel = message.guild.channels.cache.find((channel) => {
			return channel.name === "🐛bug-report";
		});
		if (typeof channel !== "undefined") {
			await message.channel.send(`Before posting a bug in ${channel}, check the known bugs of the game there:\n- https://github.com/SuperBearAdventure/tracker\n- https://trello.com/b/yTojOuqv/super-bear-adventure-bugs`);
			return;
		}
		await message.channel.send("You can check the known bugs of the game there:\n- https://github.com/SuperBearAdventure/tracker\n- https://trello.com/b/yTojOuqv/super-bear-adventure-bugs");
	}
	async describe(message, command) {
		return `Type \`${command}\` to know where the known bugs of the game are tracked`;
	}
}
