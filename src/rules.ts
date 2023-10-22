import type {
	AutoModerationActionExecution,
	AutoModerationActionMetadataOptions,
	AutoModerationActionOptions,
	AutoModerationRule,
	AutoModerationRuleCreateOptions,
} from "discord.js";
import type {Localized} from "./utils/string.js";
import rule7Rule from "./rules/rule7.js";
type AutoModerationRuleData = Omit<AutoModerationRuleCreateOptions, "exemptChannels" | "exemptRoles" | "actions"> & {
	exemptChannels?: string[],
	exemptRoles?: string[],
	actions: (
		Omit<AutoModerationActionOptions, "metadata"> & {
			metadata?: Omit<AutoModerationActionMetadataOptions, "channel"> & {
				channel?: string,
			},
		}
	)[],
};
type Rule = {
	register(): AutoModerationRuleData;
	execute(execution: AutoModerationActionExecution): Promise<void>;
	describe(autoModerationRule: AutoModerationRule): Localized<(groups: {}) => string>;
};
const rule7: Rule = rule7Rule;
export type {Rule as default};
export type {
	AutoModerationActionExecution,
	AutoModerationRule,
	AutoModerationRuleData,
};
export {
	rule7,
};
