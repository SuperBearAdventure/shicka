import type {
	ApplicationCommandData,
	GuildBasedChannel,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Localized} from "../utils/string.js";
import {list} from "../utils/string.js";
const commandName: string = "tracker";
const commandDescription: string = "Tells you where to check known bugs of the game";
const trackers: string[] = [
	"[*Current tracker*](<https://github.com/SuperBearAdventure/tracker>)",
	"[*Former tracker*](<https://trello.com/b/yTojOuqv/super-bear-adventure-bugs>)",
];
function computeHelpLocalizations(): Localized<() => string> {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandName}\` to know where to check known bugs of the game`;
		},
		"fr"(): string {
			return `Tape \`/${commandName}\` pour savoir où consulter des bogues connus du jeu`;
		},
	});
}
const trackerCommand: Command = {
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
		const linkList: string = list(trackers);
		const {guild}: CommandInteraction = interaction;
		if (guild == null) {
			return;
		}
		const channel: GuildBasedChannel | undefined = guild.channels.cache.find((channel: GuildBasedChannel): boolean => {
			return channel.name === "🐛│bug-report";
		});
		const intent: string = channel != null ? `Before reporting a bug in ${channel},` : "You can";
		await interaction.reply({
			content: `${intent} check the known bugs of the game there:\n${linkList}`,
		});
	},
	describe(interaction: CommandInteraction): Localized<() => string> {
		return computeHelpLocalizations();
	},
};
export default trackerCommand;
