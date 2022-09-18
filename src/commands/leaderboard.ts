import type {
	ApplicationCommandData,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type Command from "../commands.js";
import type {Localized} from "../utils/string.js";
import {list} from "../utils/string.js";
const commandName: string = "leaderboard";
const commandDescription: string = "Tells you where to watch community speedruns of the game";
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
function computeHelpLocalizations(): Localized<() => string> {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandName}\` to know where to watch community speedruns of the game`;
		},
		"fr"(): string {
			return `Tape \`/${commandName}\` pour savoir où regarder des speedruns communautaires du jeu`;
		},
	});
}
const leaderboardCommand: Command = {
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
		const linkList: string = list(leaderboards);
		await interaction.reply({
			content: `You can watch community speedruns there:\n${linkList}`,
		});
	},
	describe(interaction: CommandInteraction): Localized<() => string> {
		return computeHelpLocalizations();
	},
};
export default leaderboardCommand;
