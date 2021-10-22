type HelpGroups = {
	commandMention: () => string,
	typeOptionDescription: () => string,
	identifierOptionDescription: () => string,
};
type NoTypeReplyGroups = {
	typeConjunction: () => string,
};
type NoIdentifierReplyGroups = {
	max: () => string,
};
type RawDependency = {
	help: HelpGroups,
};
export type {RawDependency as default};
