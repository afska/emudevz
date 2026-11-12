import JSZip from "jszip";
import _ from "lodash";
import dictionaryEntries from "./data/dictionaryEntries";
import filesystem from "./filesystem";
import { LANGUAGES } from "./locales";
import store from "./store";
import { blob } from "./utils";

const TYPE = "emudevz-lang-pack";
const FORMAT_VERSION = 1;
const FILE_PATH = "/.langpack";
const LOCALSTORAGE_KEY = "emudevz-langpack";
const META_FILE = "lang.json";
const LOCALES_FILE = "locales.json";
const DICTIONARY_FILE = "dictionary.json";
const TESTS_FILE = "tests.json";
const ASSEMBLY_HELP_FILE = "levels/assembly_help.txt";
const CHAPTER_FILE_REGEXP = /^levels\/([^/]+)\/chapter\.json$/;
const LEVEL_FILE_REGEXP = /^levels\/([^/]+)\/([^/]+)\/(.+)$/;

export const LANGPACK_EXTENSION = ".emudevz-lang";

let pack = null;

export default {
	get current() {
		return pack;
	},

	get isActive() {
		return pack != null && store.getState().savedata.language === pack.code;
	},

	get isInstalled() {
		return localStorage.getItem(LOCALSTORAGE_KEY) != null;
	},

	async restore() {
		if (!this.isInstalled) return;

		try {
			await filesystem.load;
			if (!filesystem.fs.existsSync(FILE_PATH)) return;

			const content = filesystem.fs.readFileSync(FILE_PATH).toString();
			pack = await parse(blob.base64ToArrayBuffer(content));
			localizeDictionary();
		} catch (err) {
			console.error("❌  Invalid language pack", err);
		}
	},

	async install(zipContent) {
		const newPack = await parse(zipContent);
		await filesystem.load;
		filesystem.fs.writeFileSync(
			FILE_PATH,
			blob.arrayBufferToBase64(zipContent)
		);
		await filesystem.waitUntilIdle();
		localStorage.setItem(LOCALSTORAGE_KEY, newPack.code);

		return newPack;
	},

	async uninstall() {
		await filesystem.load;
		pack = null;
		localStorage.removeItem(LOCALSTORAGE_KEY);
		if (filesystem.fs.existsSync(FILE_PATH))
			filesystem.fs.unlinkSync(FILE_PATH);
		await filesystem.waitUntilIdle();
	},

	localizeBook(book) {
		if (pack == null) return;

		for (let chapter of book.chapters) {
			const chapterPack = pack.chapters[chapter.folder] ?? {};
			localize(chapter.name, chapterPack.name);
			if (chapter.description != null)
				localize(chapter.description, chapterPack.description);
			if (chapter.help != null)
				localize(chapter.help, chapter.help.en ? pack.assemblyHelp : null);

			for (let level of chapter.levels)
				localize(level.name, this.getLevel(chapter.folder, level.folder).name);
		}
	},

	getLevel(chapterFolder, levelFolder) {
		return pack?.levels[`${chapterFolder}/${levelFolder}`] ?? { bin: {} };
	},

	getTestName(name) {
		return this.isActive ? pack.tests[name] ?? null : null;
	},

	localize(texts, value) {
		localize(texts, value);
	},
};

async function parse(zipContent) {
	const zip = await JSZip.loadAsync(zipContent);

	const meta = await readJSON(zip, META_FILE);
	if (meta?.type !== TYPE) throw new Error(`Invalid file: ${META_FILE}`);
	if (meta.format !== FORMAT_VERSION)
		throw new Error(`Unsupported format: ${meta.format}`);
	if (!/^[a-z]{2}$/.test(meta.code) || LANGUAGES.includes(meta.code))
		throw new Error(`Invalid language code: ${meta.code}`);
	if (typeof meta.name !== "string" || !Number.isInteger(meta.version))
		throw new Error(`Invalid file: ${META_FILE}`);

	const newPack = {
		code: meta.code,
		name: meta.name,
		version: meta.version,
		locales: _.pickBy(await readJSON(zip, LOCALES_FILE), _.isString),
		dictionary: (await readJSON(zip, DICTIONARY_FILE)) ?? {},
		tests: _.pickBy(await readJSON(zip, TESTS_FILE), _.isString),
		assemblyHelp: await readText(zip, ASSEMBLY_HELP_FILE),
		chapters: {},
		levels: {},
	};

	for (let path in zip.files) {
		if (zip.files[path].dir) continue;

		const chapterMatch = path.match(CHAPTER_FILE_REGEXP);
		if (chapterMatch) {
			newPack.chapters[chapterMatch[1]] = (await readJSON(zip, path)) ?? {};
			continue;
		}

		const levelMatch = path.match(LEVEL_FILE_REGEXP);
		if (!levelMatch) continue;
		const [, chapterFolder, levelFolder, file] = levelMatch;
		const level = (newPack.levels[`${chapterFolder}/${levelFolder}`] ??= {
			bin: {},
		});

		if (file === "meta.json")
			Object.assign(
				level,
				_.pick(await readJSON(zip, path), "name", "version")
			);
		else if (file === "chat.yml") level.chat = await readText(zip, path);
		else if (file.startsWith("bin/") && file.endsWith(`.${meta.code}.md`))
			level.bin[file.replace("bin/", "")] = await readText(zip, path);
	}

	return newPack;
}

function localizeDictionary() {
	for (let key in dictionaryEntries) {
		const entry = dictionaryEntries[key];
		const entryPack = pack.dictionary[key];
		const isUpToDate = entryPack?.version === entry.version;

		entry[pack.code] =
			isUpToDate && typeof entryPack.definition === "string"
				? entryPack.definition
				: entry.en;

		if (isUpToDate && typeof entryPack.also === "string")
			entry.also = { ...entry.also, [pack.code]: entryPack.also };
	}
}

function localize(texts, value) {
	texts[pack.code] = typeof value === "string" ? value : texts.en;
}

async function readJSON(zip, path) {
	try {
		return JSON.parse(await zip.file(path).async("string"));
	} catch {
		return null;
	}
}

async function readText(zip, path) {
	return (await zip.file(path)?.async("string")) ?? null;
}
