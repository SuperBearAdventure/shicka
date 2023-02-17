type HelpGroups = {
	commandName: () => string,
	missionOptionDescription: () => string,
};
type ReplyGroups = {
	challengeName: () => string,
	levelName: () => string,
	scheduleList: () => string,
};
type BareReplyGroups = {
	dayTime: () => string,
	scheduleList: () => string,
};
type MissionNameGroups = {
	challengeName: () => string,
	levelName: () => string,
};
type ScheduleGroups = {
	dayDateTime: () => string,
};
type BareScheduleGroups = {
	dayDate: () => string,
	challengeName: () => string,
	levelName: () => string,
};
type MissionDependency = {
	help: HelpGroups,
	reply: ReplyGroups,
	bareReply: BareReplyGroups,
	missionName: MissionNameGroups,
	schedule: ScheduleGroups,
	bareSchedule: BareScheduleGroups,
};
export default MissionDependency;
