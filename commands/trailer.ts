import Command from "../command.js";
const trailers = [
	"[*Main trailer*](<https://www.youtube.com/watch?v=L00uorYTYgE>)",
	"[*Missions trailer*](<https://www.youtube.com/watch?v=j3vwu0JWIEg>)",
];
export default class TrailerCommand extends Command {
	register(client, name) {
		const description = "Tells you where to watch official trailers of the game";
		return {name, description};
	}
	async execute(interaction) {
		const linkList = trailers.map((trailer) => {
			return `\u{2022} ${trailer}`;
		}).join("\n");
		await interaction.reply({
			content: `You can watch official trailers of the game there:\n${linkList}`,
		});
	}
	describe(interaction, name) {
		return `Type \`/${name}\` to know where to watch official trailers of the game`;
	}
}
