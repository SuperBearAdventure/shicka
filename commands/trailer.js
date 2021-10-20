import Command from "../command.js";
const trailers = [
	"*Main trailer*: https://www.youtube.com/watch?v=L00uorYTYgE",
	"*Missions trailer*: https://www.youtube.com/watch?v=j3vwu0JWIEg",
];
export default class TrailerCommand extends Command {
	async execute(interaction) {
		const linkList = trailers.map((trailer) => {
			return `- ${trailer}`;
		}).join("\n");
		await (await interaction.reply({
			content: `You can watch official trailers of the game there:\n${linkList}`,
			fetchReply: true,
		})).suppressEmbeds(true);
	}
	describe(interaction, name) {
		const description = `Type \`/${name}\` to know where to watch official trailers of the game`;
		return {name, description};
	}
}
