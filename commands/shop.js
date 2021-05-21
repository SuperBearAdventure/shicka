import Command from "../command.js";
export default class ShopCommand extends Command {
	async execute(message, parameters) {
		const {commands, prefix} = message.client;
		await commands.outfit.execute(message, ["shop", ...parameters.slice(1)]);
		const search = parameters.slice(1).join(" ") && " Some outfit";
		await message.channel.send(`> By the way, \`${prefix}shop${search}\` is deprecated and will be removed soon, please use \`${prefix}outfit${search}\` instead.`);
	}
	async describe(message, command) {
		return "";
	}
}
