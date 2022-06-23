import fs from "node:fs/promises";
import url from "node:url";
const {readdir} = fs;
const {fileURLToPath} = url;
async function load(directory, extension, callback) {
	const {length} = extension;
	const files = await readdir(fileURLToPath(directory));
	const entries = await Promise.all(files.filter((file) => {
		return file.endsWith(extension);
	}).map(async (file) => {
		const key = file.slice(0, -length);
		const value = await callback(`${directory}/${file}`);
		return [key, value];
	}));
	return Object.assign(Object.create(null), Object.fromEntries(entries));
}
export async function loadActions(directory) {
	return await load(directory, ".js", async (path) => {
		const action = new (await import(path)).default();
		return action;
	});
}
export async function loadBindings(directory) {
	return await load(directory, ".json", async (path) => {
		const binding = (await import(path, {
			assert: {
				type: "json",
			},
		})).default;
		for (const [key, value] of binding.entries()) {
			value.id = key;
		}
		return binding;
	});
}
export async function loadGreetings(directory) {
	return await load(directory, ".json", async (path) => {
		const greeting = (await import(path, {
			assert: {
				type: "json",
			},
		})).default;
		return greeting;
	});
}
