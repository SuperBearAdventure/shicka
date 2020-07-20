export class Command {
	constructor(pattern, execute) {
		this._pattern = pattern;
		this._execute = execute;
	}
	test(content) {
		const array = content.match(this._pattern);
		if (array === null) {
			return null;
		}
		const [, ...parameters] = array;
		return parameters;
	}
	async execute(message, ...parameters) {
		await this._execute(message, ...parameters);
	}
	toString() {
		return "";
	}
}
