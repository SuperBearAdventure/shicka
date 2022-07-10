import type {
	ApplicationCommandData,
	GuildBasedChannel,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const commandName: string = "tracker";
const commandDescription: string = "Tells you where to check known bugs of the game";
const trackers: string[] = [
	"[*Current tracker*](<https://github.com/SuperBearAdventure/tracker>)",
	"[*Former tracker*](<https://trello.com/b/yTojOuqv/super-bear-adventure-bugs>)",
];
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
	describe(interaction: CommandInteraction): string | null {
		return `Type \`/${commandName}\` to know where to check known bugs of the game`;
	},
};
export default trackerCommand;
