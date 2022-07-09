import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
const commandNameLocalizations: {[k: string]: string} = {
	"en-US": "leaderboard",
	"fr": "classement",
};
const commandName: string = commandNameLocalizations["en-US"];
const commandDescriptionLocalizations: {[k: string]: string} = {
	"en-US": "Tells you where to watch community speedruns of the game",
	"fr": "Te dit où regarder des speedruns communautaires du jeu",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const leaderboards: string[] = [
	"[*Full-game leaderboard*](<https://www.speedrun.com/sba>)",
	"[*Turtle Village leaderboard*](<https://www.speedrun.com/sba/Turtle_Village>)",
	"[*Snow Valley leaderboard*](<https://www.speedrun.com/sba/Snow_Valley>)",
	"[*Beemothep Desert leaderboard*](<https://www.speedrun.com/sba/Beemothep_Desert>)",
	"[*Giant House leaderboard*](<https://www.speedrun.com/sba/Giant_House>)",
	"[*Missions leaderboard*](<https://www.speedrun.com/sbace/Missions>)",
	"[*Races leaderboard*](<https://www.speedrun.com/sbace/Races>)",
	"[*Category Extensions leaderboard*](<https://www.speedrun.com/sbace>)",
];
function computeHelpLocalizations(): {[k in string]: () => string} {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandNameLocalizations["en-US"]}\` to know where to watch community speedruns of the game`;
		},
		"fr"(): string {
			return `Tape \`/${commandNameLocalizations["fr"]}\` pour savoir où regarder des speedruns communautaires du jeu`;
		},
	});
}
const leaderboardCommand: Command = {
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
		const linkList: string = leaderboards.map((leaderboard: string): string => {
			return `\u{2022} ${leaderboard}`;
		}).join("\n");
		await interaction.reply({
			content: `You can watch community speedruns there:\n${linkList}`,
		});
	},
	describe(interaction: CommandInteraction): {[k in string]: () => string} {
		return computeHelpLocalizations();
	},
};
export default leaderboardCommand;
