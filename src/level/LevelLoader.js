import JSZip from "jszip";
import YAML from "yaml";
import { LANGUAGES } from "../locales";
import { blob as blobUtils } from "../utils";
import Level from "./Level";
import ChatScript from "./chat/ChatScript";

const META_FILE = "meta.json";
const CHAT_FOLDER = "chat";
const CHAT_EXTENSION = "yml";
const CODE_FOLDER = "code";
const MEDIA_FOLDER = "media";

export default class LevelLoader {
	constructor(zipContent, levelId) {
		this.zipContent = zipContent;
		this.levelId = levelId;
	}

	async load() {
		const zip = await JSZip.loadAsync(this.zipContent);

		const meta = await this._loadMeta(zip);
		const chatScripts = await this._loadChatScripts(zip);
		const code = await this._loadCode(zip);
		const media = await this._loadMedia(zip);

		const level = new Level(this.levelId, meta, chatScripts, code, media);
		level.validate();

		return level;
	}

	async _loadMeta(zip) {
		const metaFile = zip.file(META_FILE);
		if (!metaFile) throw new Error(`Missing file: ${META_FILE}`);

		const rawMeta = await metaFile.async("string");
		return JSON.parse(rawMeta);
	}

	async _loadChatScripts(zip) {
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

		return chatScripts;
	}

	async _loadCode(zip) {
		return await this._forEachFile(zip, CODE_FOLDER, async (filePath) => {
			return await zip.file(filePath).async("string");
		});
	}

	async _loadMedia(zip) {
		return await this._forEachFile(zip, MEDIA_FOLDER, async (filePath) => {
			const blob = await zip.file(filePath).async("blob");
			return await blobUtils.toBase64(blob);
		});
	}

	async _forEachFile(zip, folder, read) {
		const files = {};
		const prefix = `${folder}/`;

		for (let filePath in zip.files) {
			if (!zip.files[filePath].dir && filePath.startsWith(prefix)) {
				const fileName = filePath.replace(prefix, "");
				files[fileName] = await read(filePath);
			}
		}

		return files;
	}
}
