import Command from "../command.js";
export default class CountCommand extends Command {
	async execute(message, parameters) {
		const {memberCount} = message.guild;
		await message.channel.send(`There are ${memberCount} members on the official *Super Bear Adventure* *Discord* server!`);
	}
	async describe(message, command) {
		return `Type \`${command}\` to know the number of members on the server`;
	}
}
