type HelpGroups = {
	commandName: () => string,
	baseOptionDescription: () => string,
	stylesOptionDescription: () => string,
};
type NoPrivacyReplyGroups = {};
type EmojiDependency = {
	help: HelpGroups,
	noPrivacyReply: NoPrivacyReplyGroups,
};
export default EmojiDependency;
