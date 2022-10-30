import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionData,
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
import {compileAll, composeAll, list, localize, nearest} from "../utils/string.js";
type HelpGroups = {
	commandName: () => string,
	missionOptionDescription: () => string,
};
const commandName: string = "mission";
const commandDescriptionLocalizations: Localized<string> = {
	"en-US": "Tells you what is playable in the shop or when it is playable",
	"fr": "Te dit ce qui est jouable dans la boutique ou quand c'est jouable",
};
const commandDescription: string = commandDescriptionLocalizations["en-US"];
const missionOptionName: string = "mission";
const missionOptionDescriptionLocalizations: Localized<string> = {
	"en-US": "Some mission",
	"fr": "Une mission",
};
const missionOptionDescription: string = missionOptionDescriptionLocalizations["en-US"];
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
const helpLocalizations: Localized<(groups: HelpGroups) => string> = compileAll<HelpGroups>({
	"en-US": "Type `/$<commandName>` to know what is playable in the shop\nType `/$<commandName> $<missionOptionDescription>` to know when `$<missionOptionDescription>` is playable in the shop",
	"fr": "Tape `/$<commandName>` pour savoir ce qui est jouable dans la boutique\nTape `/$<commandName> $<missionOptionDescription>` pour savoir quand `$<missionOptionDescription>` est jouable dans la boutique",
});
const missionCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription,
			descriptionLocalizations: commandDescriptionLocalizations,
			options: [
				((): ApplicationCommandOptionData & {minValue: number, maxValue: number} => ({
					type: "INTEGER",
					name: missionOptionName,
					description: missionOptionDescription,
					descriptionLocalizations: missionOptionDescriptionLocalizations,
					minValue: 0,
					maxValue: missions.length - 1,
					autocomplete: true,
				}))(),
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
			const suggestions: ApplicationCommandOptionChoiceData[] = results.map<ApplicationCommandOptionChoiceData>((mission: Mission): ApplicationCommandOptionChoiceData => {
				const {id}: Mission = mission;
				const name: string = `${challenges[mission.challenge].name["en-US"]} in ${levels[mission.level].name["en-US"]}`;
				return {
					name: name,
					value: id,
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
		const id: number | null = options.getInteger(missionOptionName);
		if (id == null) {
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
		await interaction.reply({
			content: `Each mission starts at *${Util.escapeMarkdown(dayTime)}*:\n${scheduleList}`,
		});
		return;
		}
		const mission: Mission = missions[id];
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
		await interaction.reply({
			content: `**${Util.escapeMarkdown(challenge)}** in **${Util.escapeMarkdown(level)}** will be playable for 1 day starting:\n${scheduleList}`,
		});
	},
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: keyof Localized<unknown>): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
				missionOptionDescription: (): string => {
					return missionOptionDescriptionLocalizations[locale];
				},
			};
		}));
	},
};
export default missionCommand;
