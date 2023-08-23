type HelpGroups = {
	commandName: () => string,
	baseOptionDescription: () => string,
	stylesOptionDescription: () => string,
};
type EmojiDependency = {
	help: HelpGroups,
};
export type {EmojiDependency as default};
