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
	noTypeReply: NoTypeReplyGroups,
	noIdentifierReply: NoIdentifierReplyGroups,
};
export type {RawDependency as default};
