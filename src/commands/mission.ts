import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type {Mission} from "../bindings.js";
import type Command from "../commands.js";
import type {Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {challenges, levels, missions} from "../bindings.js";
import {list, nearest} from "../utils/string.js";
const commandName: string = "mission";
const commandDescription: string = "Tells you what is playable in the shop or when it is playable";
const missionOptionName: string = "mission";
const missionOptionDescription: string = "Some mission";
const dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "UTC",
});
const dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeZone: "UTC",
});
const timeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
	timeStyle: "short",
	timeZone: "UTC",
});
const dayTime: string = timeFormat.format(new Date(36000000));
function computeHelpLocalizations(): Localized<() => string> {
	return Object.assign(Object.create(null), {
		"en-US"(): string {
			return `Type \`/${commandName}\` to know what is playable in the shop\nType \`/${commandName} ${missionOptionDescription}\` to know when \`${missionOptionDescription}\` is playable in the shop`;
		},
		"fr"(): string {
			return `Tape \`/${commandName}\` pour savoir ce qui est jouable dans la boutique\nTape \`/${commandName} ${missionOptionDescription}\` pour savoir quand \`${missionOptionDescription}\` est jouable dans la boutique`;
		},
	});
}
const missionCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
			options: [
				{
					type: "STRING",
					name: missionOptionName,
					description: missionOptionDescription,
					autocomplete: true,
				},
			],
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (interaction.isAutocomplete()) {
			const {options}: AutocompleteInteraction = interaction;
			const {name, value}: AutocompleteFocusedOption = options.getFocused(true);
			if (name !== missionOptionName) {
				await interaction.respond([]);
				return;
			}
			const results: Mission[] = nearest<Mission>(value.toLowerCase(), missions, 7, (mission: Mission): string => {
				const name: string = `${challenges[mission.challenge].name["en-US"]} in ${levels[mission.level].name["en-US"]}`;
				return name.toLowerCase();
			});
			const suggestions: ApplicationCommandOptionChoiceData[] = results.map((mission: Mission): ApplicationCommandOptionChoiceData => {
				const name: string = `${challenges[mission.challenge].name["en-US"]} in ${levels[mission.level].name["en-US"]}`;
				return {
					name: name,
					value: name,
				};
			});
			await interaction.respond(suggestions);
			return;
		}
		if (!interaction.isCommand()) {
			return;
		}
		const {options}: CommandInteraction = interaction;
		const missionCount: number = missions.length;
		const now: number = Math.floor((interaction.createdTimestamp + 7200000) / 86400000);
		const search: string | null = options.getString(missionOptionName);
		if (search == null) {
		const schedules: string[] = [];
		for (let k: number = -1; k < 2; ++k) {
			const day: number = now + k;
			const seed: number = (day % missionCount + missionCount) % missionCount;
			const mission: Mission = missions[seed];
			const challenge: string = challenges[mission.challenge].name["en-US"];
			const level: string = levels[mission.level].name["en-US"];
			const dayDate: string = dateFormat.format(new Date(day * 86400000));
			schedules.push(`*${Util.escapeMarkdown(dayDate)}*: **${Util.escapeMarkdown(challenge)}** in **${Util.escapeMarkdown(level)}**`);
		}
		const scheduleList: string = list(schedules);
		await interaction.reply(`Each mission starts at *${Util.escapeMarkdown(dayTime)}*:\n${scheduleList}`);
		return;
		}
		const results: Mission[] = nearest<Mission>(search.toLowerCase(), missions, 1, (mission: Mission): string => {
			const name: string = `${challenges[mission.challenge].name["en-US"]} in ${levels[mission.level].name["en-US"]}`;
			return name.toLowerCase();
		});
		if (results.length === 0) {
			await interaction.reply({
				content: `I do not know any mission with this name.`,
				ephemeral: true,
			});
			return;
		}
		const mission: Mission = results[0];
		const schedules: string[] = [];
		for (let k: number = -1; k < 2 || schedules.length < 2; ++k) {
			const day: number = now + k;
			const seed: number = (day % missionCount + missionCount) % missionCount;
			if (missions[seed] === mission) {
				const dayDateTime: string = dateTimeFormat.format(new Date(day * 86400000 + 36000000));
				schedules.push(`*${Util.escapeMarkdown(dayDateTime)}*`);
			}
		}
		const challenge: string = challenges[mission.challenge].name["en-US"];
		const level: string = levels[mission.level].name["en-US"];
		const scheduleList: string = list(schedules);
		await interaction.reply(`**${Util.escapeMarkdown(challenge)}** in **${Util.escapeMarkdown(level)}** will be playable for 1 day starting:\n${scheduleList}`);
	},
	describe(interaction: CommandInteraction): Localized<() => string> {
		return computeHelpLocalizations();
	},
};
export default missionCommand;
