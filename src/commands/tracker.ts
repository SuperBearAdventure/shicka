import type {
	ApplicationCommandData,
	GuildBasedChannel,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const commandNameLocalizations: {[k: string]: string} = {
	"en-US": "tracker",
	"fr": "suivi",
};
const commandName: string = commandNameLocalizations["en-US"];
const commandDescriptionLocalizations: {[k: string]: string} = {
	"en-US": "Tells you where to check known bugs of the game",
	"fr": "Te dit où consulter des bogues connus du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const trackers: string[] = [
	"[*Current tracker*](<https://github.com/SuperBearAdventure/tracker>)",
	"[*Former tracker*](<https://trello.com/b/yTojOuqv/super-bear-adventure-bugs>)",
];
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandNameLocalizations["en-US"]}\` to know where to check known bugs of the game`;
		},
		"fr"(): string {
			return `Tape \`/${commandNameLocalizations["fr"]}\` pour savoir où consulter des bogues connus du jeu`;
		},
	});
}
const trackerCommand: Command = {
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
		const linkList: string = trackers.map((tracker: string): string => {
			return `\u{2022} ${tracker}`;
		}).join("\n");
		const {guild}: CommandInteraction = interaction;
		if (guild == null) {
			return;
		}
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "🐛・bug-report";
		});
		const intent: string = channel != null ? `Before reporting a bug in ${channel},` : "You can";
		await interaction.reply({
			content: `${intent} check the known bugs of the game there:\n${linkList}`,
		});
	},
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		return computeHelpLocalizations();
	},
};
export default trackerCommand;
