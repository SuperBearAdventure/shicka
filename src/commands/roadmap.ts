import type {
	ApplicationCommandData,
	GuildBasedChannel,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const roadmapCommand: Command = {
	register(name: string): ApplicationCommandData {
		const description: string = "Tells you where to check the upcoming milestones of the game";
		return {name, description};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) {
			return;
		}
		const {guild}: CommandInteraction = interaction;
		if (guild == null) {
			return;
		}
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "💡・game-suggestions";
		});
		const intent: string = channel != null ? `Before suggesting an idea in ${channel},` : "You can";
		await interaction.reply({
			content: `${intent} check the upcoming milestones of the game [there](<https://trello.com/b/3DPL9CwV/road-to-100>).`,
		});
	},
	describe(interaction: CommandInteraction, name: string): string | null {
		return `Type \`/${name}\` to know where to check the upcoming milestones of the game`;
	},
};
export default roadmapCommand;
