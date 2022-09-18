import type {
	ApplicationCommandData,
	GuildBasedChannel,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Localized} from "../utils/string.js";
const commandName: string = "roadmap";
const commandDescription: string = "Tells you where to check the upcoming milestones of the game";
function computeHelpLocalizations(): Localized<() => string> {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandName}\` to know where to check the upcoming milestones of the game`;
		},
		"fr"(): string {
			return `Tape \`/${commandName}\` pour savoir où consulter les futurs jalons du jeu`;
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
			return channel.name === "💡│game-suggestions";
		});
		const intent: string = channel != null ? `Before suggesting an idea in ${channel},` : "You can";
		await interaction.reply({
			content: `${intent} check the upcoming milestones of the game [there](<https://trello.com/b/3DPL9CwV/road-to-100>).`,
		});
	},
	describe(interaction: CommandInteraction): Localized<() => string> {
		return computeHelpLocalizations();
	},
};
export default roadmapCommand;
