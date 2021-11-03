import discord from "discord.js";
import Command from "../command.js";
const {MessageActionRow, MessageSelectMenu} = discord;
export default class SubcriptionCommand extends Command {
	register(client, name) {
		const description = "TODO";
		const options = [
			{
				type: "SUB_COMMAND",
				name: "add",
				description: `TODO`,
				options: [
					{
						type: "CHANNEL",
						name: "channel",
						description: "Some channel",
						required: true,
						channelTypes: [
							"GUILD_TEXT",
						],
					},
					{
						type: "STRING",
						name: "message",
						description: "Some message",
						required: true,
					},
					{
						type: "ROLE",
						name: "role",
						description: "Some role",
						required: true,
					},
					{
						type: "STRING",
						name: "description",
						description: "Some description",
						required: true,
					},
				],
			},
			{
				type: "SUB_COMMAND",
				name: "remove",
				description: `TODO`,
				options: [
					{
						type: "CHANNEL",
						name: "channel",
						description: "Some channel",
						required: true,
						channelTypes: [
							"GUILD_TEXT",
						],
					},
					{
						type: "STRING",
						name: "message",
						description: "Some message",
						required: true,
					},
					{
						type: "ROLE",
						name: "role",
						description: "Some role",
						required: true,
					},
				],
			},
		];
		const defaultPermission = false;
		return {name, description, options, defaultPermission};
	}
	async execute(interaction) {
		const {options} = interaction;
		const subCommand = options.getSubcommand(false);
		if (subCommand == null || !(subCommand === "add" || subCommand == "remove")) {
			await interaction.reply({
				content: `TODO.`,
				ephemeral: true,
			});
			return;
		}
		const channel = options.getChannel("channel");
		if (channel == null) {
			await interaction.reply({
				content: `TODO.`,
				ephemeral: true,
			});
			return;
		}
		const identifier = options.getString("message");
		if (identifier == null) {
			await interaction.reply({
				content: `TODO.`,
				ephemeral: true,
			});
			return;
		}
		const message = await (async () => {
			try {
				return await channel.messages.fetch(identifier);
			} catch {
				return null;
			}
		})();
		if (message == null) {
			await interaction.reply({
				content: `TODO.`,
				ephemeral: true,
			});
			return;
		}
		const role = options.getRole("role");
		if (role == null) {
			await interaction.reply({
				content: `TODO.`,
				ephemeral: true,
			});
			return;
		}
		const {roles} = message.mentions;
		if (subCommand === "add" && !roles.has(role.id)) {
			roles.set(role.id, role);
		}
		if (subCommand === "remove" && roles.has(role.id)) {
			roles.delete(role.id);
		}
		await message.edit({
			content: `Subscription roles:\n${roles.map((role) => {
				return `- ${role}`;
			}).join("\n")}`,
			components: [
				new MessageActionRow({
					components: [
						new MessageSelectMenu({
							customId: "subscription",
							options: roles.map((role) => {
								return {
									label: role.name,
									value: role.id,
									description: "Be notified",
								};
							}),
							minValues: 0,
							maxValues: roles.size,
						}),
					],
				}),
			],
		});
		await interaction.reply("DONE");
	}
	describe(interaction, name) {
		return `Type \`/${name}\` to add or remove a subscription role`;
	}
}
