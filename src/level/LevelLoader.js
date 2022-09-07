import Level from "./Level";
import ChatScript from "./chat/ChatScript";
import { LANGUAGES } from "../locales";
import JSZip from "jszip";
import YAML from "yaml";

const META_FILE = "meta.json";
const CHAT_FOLDER = "chat";
const CHAT_EXTENSION = "yml";

export default class LevelLoader {
	constructor(zipContent) {
		this.zipContent = zipContent;
	}

	async load() {
		const zip = await JSZip.loadAsync(this.zipContent);

		const metaFile = zip.file(META_FILE);
		if (!metaFile) throw new Error(`Missing file: ${META_FILE}`);
		const rawMeta = await metaFile.async("string");
		const meta = JSON.parse(rawMeta);

		const chatScripts = {};
		await Promise.all(
			LANGUAGES.map(async (language) => {
				const chatFilePath = `${CHAT_FOLDER}/${language}.${CHAT_EXTENSION}`;
				const chatFile = zip.file(chatFilePath);
				if (!chatFile) throw new Error(`Missing file: ${chatFilePath}`);
				const rawChat = await chatFile.async("string");
				const chat = YAML.parse(rawChat);
				const chatScript = new ChatScript(chat, language);

				chatScript.validate();
				chatScripts[language] = chatScript;
			})
		);

		const level = new Level(meta, chatScripts);
		level.validate();

		return level;
	}
}
