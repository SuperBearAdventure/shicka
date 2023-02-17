import type {
	ApplicationCommandData,
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CommandInteraction,
	Interaction,
} from "discord.js";
import type {Challenge, Level, Mission} from "../bindings.js";
import type Command from "../commands.js";
import type {Mission as MissionCompilation} from "../compilations.js";
import type {Mission as MissionDefinition} from "../definitions.js";
import type {Mission as MissionDependency} from "../dependencies.js";
import type {Locale, Localized} from "../utils/string.js";
import {Util} from "discord.js";
import {challenges, levels, missions} from "../bindings.js";
import {mission as missionCompilation} from "../compilations.js";
import {mission as missionDefinition} from "../definitions.js";
import {composeAll, list, localize, nearest, resolve} from "../utils/string.js";
type HelpGroups = MissionDependency["help"];
type ScheduleGroups = MissionDependency["schedule"];
type BareScheduleGroups = MissionDependency["bareSchedule"];
const {
	commandName,
	commandDescription,
	missionOptionName,
	missionOptionDescription,
}: MissionDefinition = missionDefinition;
const {
	help: helpLocalizations,
	reply: replyLocalizations,
	bareReply: bareReplyLocalizations,
	missionName: missionNameLocalizations,
	schedule: scheduleLocalizations,
	bareSchedule: bareScheduleLocalizations,
}: MissionCompilation = missionCompilation;
const dayTime: Date = new Date(36000000);
const missionCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: commandName,
			description: commandDescription["en-US"],
			descriptionLocalizations: commandDescription,
			options: [
				((): ApplicationCommandOptionData & {minValue: number, maxValue: number} => ({
					type: "INTEGER",
					name: missionOptionName,
					description: missionOptionDescription["en-US"],
					descriptionLocalizations: missionOptionDescription,
					minValue: 0,
					maxValue: missions.length - 1,
					autocomplete: true,
				}))(),
			],
		};
	},
	async execute(interaction: Interaction): Promise<void> {
		if (interaction.isAutocomplete()) {
			const {locale, options}: AutocompleteInteraction = interaction;
			const resolvedLocale: Locale = resolve(locale);
			const {name, value}: AutocompleteFocusedOption = options.getFocused(true);
			if (name !== missionOptionName) {
				await interaction.respond([]);
				return;
			}
			const results: Mission[] = nearest<Mission>(value.toLowerCase(), missions, 7, (mission: Mission): string => {
				const challenge: Challenge = challenges[mission.challenge];
				const level: Level = levels[mission.level];
				const missionName: string = missionNameLocalizations[resolvedLocale]({
					challengeName: (): string => {
						return challenge.name[resolvedLocale];
					},
					levelName: (): string => {
						return level.name[resolvedLocale];
					},
				});
				return missionName.toLowerCase();
			});
			const suggestions: ApplicationCommandOptionChoiceData[] = results.map<ApplicationCommandOptionChoiceData>((mission: Mission): ApplicationCommandOptionChoiceData => {
				const {id}: Mission = mission;
				const challenge: Challenge = challenges[mission.challenge];
				const level: Level = levels[mission.level];
				const missionName: string = missionNameLocalizations[resolvedLocale]({
					challengeName: (): string => {
						return challenge.name[resolvedLocale];
					},
					levelName: (): string => {
						return level.name[resolvedLocale];
					},
				});
				return {
					name: missionName,
					value: id,
				};
			});
			await interaction.respond(suggestions);
			return;
		}
		if (!interaction.isCommand()) {
			return;
		}
		const {locale, options}: CommandInteraction = interaction;
		const resolvedLocale: Locale = resolve(locale);
		const missionCount: number = missions.length;
		const now: number = Math.floor((interaction.createdTimestamp + 7200000) / 86400000);
		const id: number | null = options.getInteger(missionOptionName);
		if (id == null) {
		const schedules: Localized<(groups: {}) => string>[] = [];
		for (let k: number = -1; k < 2; ++k) {
			const day: number = now + k;
			const seed: number = (day % missionCount + missionCount) % missionCount;
			const mission: Mission = missions[seed];
			const challenge: Challenge = challenges[mission.challenge];
			const level: Level = levels[mission.level];
			const dayDate: Date = new Date(day * 86400000);
			const schedule: Localized<(groups: {}) => string> = composeAll<BareScheduleGroups, {}>(bareScheduleLocalizations, localize<BareScheduleGroups>((locale: Locale): BareScheduleGroups => {
				return {
					dayDate: (): string => {
						const dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
							dateStyle: "long",
							timeZone: "UTC",
						});
						return Util.escapeMarkdown(dateFormat.format(dayDate));
					},
					challengeName: (): string => {
						return Util.escapeMarkdown(challenge.name[locale]);
					},
					levelName: (): string => {
						return Util.escapeMarkdown(level.name[locale]);
					},
				};
			}));
			schedules.push(schedule);
		}
		await interaction.reply({
			content: bareReplyLocalizations["en-US"]({
				dayTime: (): string => {
					const timeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
						timeStyle: "short",
						timeZone: "UTC",
					});
					return Util.escapeMarkdown(timeFormat.format(dayTime));
				},
				scheduleList: (): string => {
					return list(schedules.map<string>((schedule: Localized<(groups: {}) => string>): string => {
						return schedule["en-US"]({})
					}));
				},
			}),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: bareReplyLocalizations[resolvedLocale]({
				dayTime: (): string => {
					const timeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(resolvedLocale, {
						timeStyle: "short",
						timeZone: "UTC",
					});
					return Util.escapeMarkdown(timeFormat.format(dayTime));
				},
				scheduleList: (): string => {
					return list(schedules.map<string>((schedule: Localized<(groups: {}) => string>): string => {
						return schedule[resolvedLocale]({})
					}));
				},
			}),
			ephemeral: true,
		});
		return;
		}
		const mission: Mission = missions[id];
		const schedules: Localized<(groups: {}) => string>[] = [];
		for (let k: number = -1; k < 2 || schedules.length < 2; ++k) {
			const day: number = now + k;
			const seed: number = (day % missionCount + missionCount) % missionCount;
			if (missions[seed] === mission) {
				const dayDateTime: Date = new Date(day * 86400000 + 36000000);
				const schedule: Localized<(groups: {}) => string> = composeAll<ScheduleGroups, {}>(scheduleLocalizations, localize<ScheduleGroups>((locale: Locale): ScheduleGroups => {
					return {
						dayDateTime: (): string => {
							const dateTimeFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
								dateStyle: "long",
								timeStyle: "short",
								timeZone: "UTC",
							});
							return Util.escapeMarkdown(dateTimeFormat.format(dayDateTime));
						},
					};
				}));
				schedules.push(schedule);
			}
		}
		const challenge: Challenge = challenges[mission.challenge];
		const level: Level = levels[mission.level];
		await interaction.reply({
			content: replyLocalizations["en-US"]({
				challengeName: (): string => {
					return Util.escapeMarkdown(challenge.name["en-US"]);
				},
				levelName: (): string => {
					return Util.escapeMarkdown(level.name["en-US"]);
				},
				scheduleList: (): string => {
					return list(schedules.map<string>((schedule: Localized<(groups: {}) => string>): string => {
						return schedule["en-US"]({})
					}));
				},
			}),
		});
		if (resolvedLocale === "en-US") {
			return;
		}
		await interaction.followUp({
			content: replyLocalizations[resolvedLocale]({
				challengeName: (): string => {
					return Util.escapeMarkdown(challenge.name[resolvedLocale]);
				},
				levelName: (): string => {
					return Util.escapeMarkdown(level.name[resolvedLocale]);
				},
				scheduleList: (): string => {
					return list(schedules.map<string>((schedule: Localized<(groups: {}) => string>): string => {
						return schedule[resolvedLocale]({})
					}));
				},
			}),
			ephemeral: true,
		});
	},
	describe(interaction: CommandInteraction): Localized<(groups: {}) => string> | null {
		return composeAll<HelpGroups, {}>(helpLocalizations, localize<HelpGroups>((locale: Locale): HelpGroups => {
			return {
				commandName: (): string => {
					return commandName;
				},
				missionOptionDescription: (): string => {
					return missionOptionDescription[locale];
				},
			};
		}));
	},
};
export default missionCommand;
