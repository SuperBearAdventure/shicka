const trailers = [
	"[*Main trailer*](<https://www.youtube.com/watch?v=L00uorYTYgE>)",
	"[*Missions trailer*](<https://www.youtube.com/watch?v=j3vwu0JWIEg>)",
];
const trailerCommand = {
	register(name) {
		const description = "Tells you where to watch official trailers of the game";
		return {name, description};
	},
	async execute(interaction) {
		if (!interaction.isCommand()) {
			return;
		}
		const linkList = trailers.map((trailer) => {
			return `\u{2022} ${trailer}`;
		}).join("\n");
		await interaction.reply({
			content: `You can watch official trailers of the game there:\n${linkList}`,
		});
	},
	describe(interaction, name) {
		return `Type \`/${name}\` to know where to watch official trailers of the game`;
	},
};
export default trailerCommand;
