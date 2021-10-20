import Command from "../command.js";
const trackers = [
	"*Current tracker*: https://github.com/SuperBearAdventure/tracker",
	"*Former tracker*: https://trello.com/b/yTojOuqv/super-bear-adventure-bugs",
];
export default class TrackerCommand extends Command {
	register(client, name) {
		const description = "Tells you where to check known bugs of the game";
		return {name, description};
	}
	async execute(interaction) {
		const linkList = trackers.map((tracker) => {
			return `- ${tracker}`;
		}).join("\n");
		const channel = interaction.guild.channels.cache.find((channel) => {
			return channel.name === "🐛bug-report";
		});
		if (typeof channel !== "undefined") {
			await (await interaction.reply({
				content: `Before reporting a bug in ${channel}, check the known bugs of the game there:\n${linkList}`,
				fetchReply: true,
			})).suppressEmbeds(true);
			return;
		}
		await (await interaction.reply({
			content: `You can check known bugs of the game there:\n${linkList}`,
			fetchReply: true,
		})).suppressEmbeds(true);
	}
	describe(interaction, name) {
		return `Type \`/${name}\` to know where to check known bugs of the game`;
	}
}
