import url from "url";
import fs from "fs";
import discord from "discord.js";
const {fileURLToPath} = url;
const {readFile, readdir} = fs.promises;
const {Collection} = discord;
const here = import.meta.url;
const root = here.slice(0, here.lastIndexOf("/"));
export async function loadActions(directories) {
	const directoryPromises = directories.map(async (directory) => {
		const files = await readdir(fileURLToPath(`${root}/${directory}`));
		const filePromises = files.filter((file) => {
			return file.endsWith(".js");
		}).map(async (file) => {
			const name = file.slice(0, -3);
			const constructor = (await import(`${root}/${directory}/${file}`)).default;
			const action = new constructor();
			return [name, action];
		});
		return new Collection(await Promise.all(filePromises));
	});
	return await Promise.all(directoryPromises);
}
export async function loadGreetings() {
	return JSON.parse(await readFile(fileURLToPath(`${root}/greetings.json`)));
}
