import type {
	ApplicationCommandData,
	GuildBasedChannel,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const commandName: string = "roadmap";
const commandDescription: string = "Tells you where to check the upcoming milestones of the game";
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandName}\` to know where to check the upcoming milestones of the game`;
		},
	});
}
const roadmapCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
		};
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
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		return computeHelpLocalizations();
	},
};
export default roadmapCommand;
