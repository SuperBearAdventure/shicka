import type {
	AutoModerationActionExecution,
	AutoModerationActionMetadataOptions,
	AutoModerationActionOptions,
	AutoModerationRule,
	AutoModerationRuleCreateOptions,
} from "discord.js";
import type {Localized} from "./utils/string.js";
import rule7Rule from "./rules/rule7.js";
type Rule = {
	register(): Omit<AutoModerationRuleCreateOptions, "exemptChannels" | "exemptRoles" | "actions"> & {exemptChannels?: string[], exemptRoles?: string[], actions: (Omit<AutoModerationActionOptions, "metadata"> & {metadata?: Omit<AutoModerationActionMetadataOptions, "channel"> & {channel?: string}})[]};
	execute(execution: AutoModerationActionExecution): Promise<void>;
	describe(autoModerationRule: AutoModerationRule): Localized<(groups: {}) => string>;
};
const rule7: Rule = rule7Rule;
export type {Rule as default};
export {
	rule7,
};
