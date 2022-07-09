import type {
	ApplicationCommandData,
	GuildBasedChannel,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const commandNameLocalizations: {[k: string]: string} = {
	"en-US": "roadmap",
	"fr": "feuille-de-route",
};
const commandName: string = commandNameLocalizations["en-US"];
const commandDescriptionLocalizations: {[k: string]: string} = {
	"en-US": "Tells you where to check the upcoming milestones of the game",
	"fr": "Te dit où consulter les futurs jalons du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandNameLocalizations["en-US"]}\` to know where to check the upcoming milestones of the game`;
		},
		"fr"(): string {
			return `Tape \`/${commandNameLocalizations["fr"]}\` pour savoir où consulter les futurs jalons du jeu`;
		},
	});
}
const roadmapCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			nameLocalizations: commandNameLocalizations,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
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
