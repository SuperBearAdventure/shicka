import type {
	AutoModerationActionExecution,
	AutoModerationActionMetadataOptions,
	AutoModerationActionOptions,
	AutoModerationRuleCreateOptions,
	ChatInputCommandInteraction,
} from "discord.js";
import type {Localized} from "./utils/string.js";
import rule7Rule from "./rules/rule7.js";
type Rule = {
	register(): Omit<AutoModerationRuleCreateOptions, "exemptChannels" | "exemptRoles" | "actions"> & {exemptChannels?: string[], exemptRoles?: string[], actions: (Omit<AutoModerationActionOptions, "metadata"> & {metadata?: Omit<AutoModerationActionMetadataOptions, "channel"> & {channel?: string}})[]};
	execute(execution: AutoModerationActionExecution): Promise<void>;
	describe(interaction: ChatInputCommandInteraction<"cached">): Localized<(groups: {}) => string> | null;
};
const rule7: Rule = rule7Rule;
export default Rule;
export {
	rule7,
};
