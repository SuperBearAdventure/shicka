import type Command from "../commands.js";
import type {ApplicationCommand, ApplicationCommandData, ApplicationUserInteraction} from "../commands.js";
import type {Localized} from "../utils/string.js";
const {
	SHICKA_ORIGIN,
	SHICKA_VERIFICATION_PATHNAME,
}: NodeJS.ProcessEnv = process.env;
const origin: string = SHICKA_ORIGIN ?? "http://127.0.0.1:8080";
const pathname: string = SHICKA_VERIFICATION_PATHNAME ?? "/connections/";
const link: string = new URL(pathname, origin).href;
const connectCommand: Command = {
	register(): ApplicationCommandData {
		return {
			name: "connect",
			description: "Connect",
			descriptionLocalizations: {
				"en-US": "Connect",
				"fr": "Connect",
				"pt-BR": "Connect",
			},
		};
	},
	async interact(interaction: ApplicationUserInteraction): Promise<void> {
		if (!interaction.isChatInputCommand()) {
			return;
		}
		await interaction.reply({
			content: `[Connect](<${link}>)`,
			ephemeral: true,
		});
	},
describe(applicationCommand: ApplicationCommand): Localized<(groups: {}) => string> {
		return {
			"en-US": (): string => "Connect",
			"fr": (): string => "Connect",
			"pt-BR": (): string => "Connect",
		};
	},
};
export default connectCommand;
