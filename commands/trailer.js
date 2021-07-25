import Command from "../command.js";
const trailers = [
	"*Main trailer*: https://www.youtube.com/watch?v=L00uorYTYgE",
	"*Missions trailer*: https://www.youtube.com/watch?v=j3vwu0JWIEg",
];
export default class TrailerCommand extends Command {
	async execute(message, parameters) {
		const links = trailers.map((trailer) => {
			return `- ${trailer}`;
		}).join("\n");
		await (await message.channel.send(`You can watch official trailers of the game there:\n${links}`)).suppressEmbeds(true);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know where to watch official trailers of the game`;
	}
}
