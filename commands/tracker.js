import Command from "../command.js";
const trackers = [
	"*Current tracker*: https://github.com/SuperBearAdventure/tracker",
	"*Former tracker*: https://trello.com/b/yTojOuqv/super-bear-adventure-bugs",
];
export default class TrackerCommand extends Command {
	async execute(message, parameters) {
		const links = trackers.map((tracker) => {
			return `- ${tracker}`;
		}).join("\n");
		const channel = message.guild.channels.cache.find((channel) => {
			return channel.name === "🐛bug-report";
		});
		if (typeof channel !== "undefined") {
			await (await message.channel.send(`Before reporting a bug in ${channel}, check the known bugs of the game there:\n${links}`)).suppressEmbeds(true);
			return;
		}
		await (await message.channel.send(`You can check known bugs of the game there:\n${links}`)).suppressEmbeds(true);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know where to check known bugs of the game`;
	}
}
