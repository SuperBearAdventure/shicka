import fs from "node:fs/promises";
import url from "node:url";
const {readFile, readdir} = fs;
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
export async function loadData(directory) {
	return await load(directory, ".json", async (path) => {
		const datum = JSON.parse(await readFile(fileURLToPath(path)));
		for (const [key, value] of datum.entries()) {
			value.id = key;
		}
		return datum;
	});
}
export async function loadGreetings(directory) {
	return await load(directory, ".json", async (path) => {
		const greeting = JSON.parse(await readFile(fileURLToPath(path)));
		return greeting;
	});
}
