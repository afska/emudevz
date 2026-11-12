import JSZip from "jszip";
import YAML from "yaml";
import langPack from "../langPack";
import { LANGUAGES } from "../locales";
import { blob as blobUtils } from "../utils";
import Book from "./Book";
import Level from "./Level";
import ChatScript from "./chat/ChatScript";

const META_FILE = "meta.json";
const CHAT_FOLDER = "chat";
const CHAT_EXTENSION = "yml";
const CODE_FOLDER = "code";
const TESTS_FOLDER = "tests";
const BIN_FOLDER = "bin";
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
		const code = await this._loadTextFolder(zip, CODE_FOLDER);
		const tests = await this._loadTextFolder(zip, TESTS_FOLDER);
		const media = await this._loadMediaFolder(zip);
		const bin = await this._loadBinaryFolder(zip);
		const files = {
			code,
			tests,
			media,
			bin,
		};

		const level = new Level(this.levelId, meta, chatScripts, files);
		this._applyLangPack(level);
		level.init();

		return level;
	}

	_applyLangPack(level) {
		const pack = langPack.current;
		if (pack == null) return;

		const book = Book.current;
		const chapter = book?.getChapterOf(this.levelId);
		const levelDefinition = book?.getLevelDefinitionOf(this.levelId);
		const levelPack = langPack.getLevel(
			chapter?.folder,
			levelDefinition?.folder
		);

		langPack.localize(level.name, levelPack.name);
		level.chatScripts[pack.code] = level.chatScripts.en;
		if (levelPack.version !== level.version) return;

		try {
			const chatScript = new ChatScript(YAML.parse(levelPack.chat), pack.code);
			chatScript.validate();
			level.chatScripts[pack.code] = chatScript;
		} catch (err) {
			console.warn(`⚠️  Language pack: ignoring chat (${err.message})`);
		}

		Object.assign(level.bin, levelPack.bin);
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

	async _loadTextFolder(zip, folder) {
		return await this._forEachFile(zip, folder, async (filePath) => {
			return await zip.file(filePath).async("string");
		});
	}

	async _loadMediaFolder(zip) {
		return await this._forEachFile(zip, MEDIA_FOLDER, async (filePath) => {
			const blob = await zip.file(filePath).async("blob");
			return await blobUtils.toBase64(blob);
		});
	}

	async _loadBinaryFolder(zip) {
		return await this._forEachFile(zip, BIN_FOLDER, async (filePath) => {
			const blob = await zip.file(filePath).async("blob");
			return await blobUtils.toArrayBuffer(blob);
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
