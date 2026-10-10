const fs = require("fs");
const acorn = require("acorn");
const JSON5 = require("json5");
const $path = require("path");
const YAML = require("yaml");
const _ = require("lodash");

Error.stackTraceLimit = 0;

const LANGUAGES = ["es", "ru"];

const LOCALES_DIR = "src/data/locales";
const LOCALES_MAIN_FILE = "src/locales.js";
const DICTIONARY_FILE = `src/data/dictionaryEntries.js`;
const LEVELS_DIR = "src/data/levels";
const CHAPTER_METADATA_FILE = "chapter.json";
const LEVEL_METADATA_FILE = "meta.json";
const GRAPHEME_SEGMENTER = new Intl.Segmenter("en", {
	granularity: "grapheme",
});

console.log("Checking localization consistency...");

const localesMainFile = fs.readFileSync(LOCALES_MAIN_FILE).toString("utf-8");
const enLocales = getLocales("en");
const enKeyCount = getKeyCount(enLocales);
const dictionary = getDictionary();

// For each non-English language
for (let lang of LANGUAGES) {
	const locales = getLocales(lang);

	// All the keys are defined
	for (let key in enLocales) ensureKeyExists(lang, locales, key);

	// The key count is the same, with no extra keys
	const keyCount = getKeyCount(locales);
	if (keyCount !== enKeyCount)
		throw new Error(
			`Language "${lang}" has ${keyCount} keys but should have ${enKeyCount}.`
		);

	// There's a key with the language name for the Settings modal
	ensureKeyExists(lang, locales, `language_${lang}`);

	// Includes the TimeAgo instance
	const timeAgoId = `timeAgo${_.capitalize(lang)}`;
	const timeAgoImport = `import ${timeAgoId} from "javascript-time-ago/locale/${lang}";`;
	const timeAgoAdd = `TimeAgo.addLocale(${timeAgoId});`;
	const timeAgoKey = `${lang}: new TimeAgo("${lang}"),`;
	if (!localesMainFile.includes(timeAgoImport))
		throw new Error(`Missing TimeAgo import: ${timeAgoImport}`);
	if (!localesMainFile.includes(timeAgoAdd))
		throw new Error(`Missing TimeAgo add: ${timeAgoImport}`);
	if (!localesMainFile.includes(timeAgoKey))
		throw new Error(`Missing TimeAgo key: ${timeAgoImport}`);

	// Each dictionary entry has a translation for this language
	for (let id in dictionary)
		ensureKeyExists(
			lang,
			dictionary[id],
			lang,
			`Missing localization for language "${lang}" in dictionary entry "${id}"`
		);

	// Check chapters
	const chapterFolders = readDirs(LEVELS_DIR);
	for (let chapterFolder of chapterFolders) {
		const chapterPath = $path.join(LEVELS_DIR, chapterFolder);

		// Parse chapter metadata
		let chapterMetadata;
		try {
			const chapterJSON = fs
				.readFileSync($path.join(chapterPath, CHAPTER_METADATA_FILE))
				.toString();
			chapterMetadata = JSON.parse(chapterJSON);
		} catch (e) {
			throw new Error(`Invalid chapter metadata: ${chapterFolder}`);
		}

		// Chapter name and description are defined
		ensureKeyExists(
			lang,
			chapterMetadata.name,
			lang,
			`Missing localization ("name") for language "${lang}" in chapter metadata from "${chapterFolder}"`
		);
		if (chapterMetadata.description != null) {
			ensureKeyExists(
				lang,
				chapterMetadata.description,
				lang,
				`Missing localization ("description") for language "${lang}" in chapter metadata from "${chapterFolder}"`
			);
		}

		// They use the same emojis
		if (
			!areUsingSameEmojis(chapterMetadata.name.en, chapterMetadata.name[lang])
		)
			throw new Error(
				`Key ("name") for language "${lang}" in chapter metadata from "${chapterFolder}" should use the same emojis as the English version.`
			);
		if (chapterMetadata.description != null) {
			if (
				!areUsingSameEmojis(
					chapterMetadata.description.en,
					chapterMetadata.description[lang]
				)
			)
				throw new Error(
					`Key ("description") for language "${lang}" in chapter metadata from "${chapterFolder}" should use the same emojis as the English version.`
				);
		}

		// Check levels
		const levelFolders = readDirs(chapterPath);
		for (let levelFolder of levelFolders) {
			const levelPath = $path.join(chapterPath, levelFolder);

			// Parse level metadata
			let levelMetadata;
			try {
				const levelJSON = fs
					.readFileSync($path.join(levelPath, LEVEL_METADATA_FILE))
					.toString();
				levelMetadata = JSON.parse(levelJSON);
			} catch (e) {
				throw new Error(`Invalid level metadata: ${levelFolder}`);
			}

			// Level name is defined
			ensureKeyExists(
				lang,
				levelMetadata.name,
				lang,
				`Missing localization ("name") for language "${lang}" in level metadata from "${chapterFolder}"/"${levelFolder}"`
			);

			// Level name use the same emojis
			if (!areUsingSameEmojis(levelMetadata.name.en, levelMetadata.name[lang]))
				throw new Error(
					`Key ("name") for language "${lang}" in level metadata from"${chapterFolder}"/"${levelFolder}" should use the same emojis as the English version`
				);

			// Chat structure, formatting, and code match the English version
			const chatFile = $path.join(levelPath, `chat/${lang}.yml`);
			const chatEn = YAML.parse(
				fs.readFileSync($path.join(levelPath, "chat/en.yml"), "utf8")
			);
			const chat = YAML.parse(fs.readFileSync(chatFile, "utf8"));
			checkChat(chatEn, chat, `${chapterFolder}/${levelFolder}`, lang);
		}
	}

	// TODO: Check copy.js scripts
	// TODO: Check documentation
	// TODO: Check meta files
	// TODO: Check FAQ's links
	// TODO: Check Assembly help files
}

console.log("✅ All seems fine!");

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

function readDirs(path) {
	return _(fs.readdirSync(path, { withFileTypes: true }))
		.filter((it) => it.isDirectory())
		.map("name")
		.filter((it) => !it.startsWith("$"))
		.sortBy()
		.value();
}

function getLocales(lang) {
	return getObject(`${LOCALES_DIR}/${lang}.js`);
}

function getDictionary() {
	return getObject(DICTIONARY_FILE);
}

function ensureKeyExists(lang, locales, key, customMessage = null) {
	if (typeof locales[key] !== "string")
		throw new Error(
			customMessage ?? `Missing key "${key}" in language "${lang}"`
		);
}

function getObject(filePath, regexp = /^export default (.+);/s) {
	let file;
	try {
		file = fs.readFileSync(filePath).toString("utf-8");
	} catch {
		throw new Error(`File not found: ${filePath}`);
	}

	try {
		const json5 = file.match(regexp)[1];
		return JSON5.parse(json5);
	} catch {
		throw new Error(
			`Unable to parse object (\`${regexp}\`) from file: ${filePath}`
		);
	}
}

function getKeyCount(obj) {
	return Object.keys(obj).length;
}

function checkChat(base, translated, location, lang, field = "") {
	const fail = (message) => {
		throw new Error(
			`${message}\nLanguage: ${lang}\nLevel/fragment: ${location}\nEnglish:\n${YAML.stringify(
				base
			)}\nTranslation:\n${YAML.stringify(translated)}`
		);
	};

	if (Array.isArray(base) || _.isPlainObject(base)) {
		if (
			Array.isArray(base) !== Array.isArray(translated) ||
			!_.isEqual(_.keys(base).sort(), _.keys(translated).sort())
		)
			fail("Chat structure differs from English");

		for (let key in base)
			checkChat(
				base[key],
				translated[key],
				`${location}/${key}`,
				lang,
				Array.isArray(base) ? field : key
			);
		return;
	}

	if (typeof base !== "string" || typeof translated !== "string")
		fail("Invalid chat text");

	// Documentation links can point to the translated file
	let values = [
		base.replaceAll(".en.md", ".md"),
		translated.replaceAll(`.${lang}.md`, ".md"),
	];
	if (field === "messages" || field === "responses")
		values = values.map((text) => getChatSignature(text, field));
	if (!_.isEqual(values[0], values[1]))
		fail("Chat content differs from English");
}

function getChatSignature(text, field) {
	const condition = text.match(/^<<.+>> /)?.[0];
	if (condition) text = text.slice(condition.length);
	text = text.replace(
		/(```(?:javascript|js)\s+)([\s\S]*?)```/g,
		(_, prefix, code) => prefix + stripCodeComments(code) + "```"
	);

	return {
		condition,
		link: field === "responses" ? text.match(/ \[\w+\]$/)?.[0] : null,
		code: text.match(/```[\s\S]*?```/g) || [],
		lines: text.split("\n").map((line) => [
			(line.match(/(?<!`)`[^`]+`(?!`)/g) || []).sort(),
			// Modifiers, inheritance, images, delays, system messages
			(
				line.match(/^\([*kl]\) |^\.\.\..+|<\{[^}]+\}>|\{\d+\}|<!/g) || []
			).sort(),
			(line.match(/\*\*|__|[<>`]|(?!~)\p{S}/gu) || []).sort(),
			getEmojis(line).sort(),
		]),
	};
}

function stripCodeComments(code) {
	const comments = [];
	Array.from(
		acorn.tokenizer(code, { ecmaVersion: "latest", onComment: comments })
	);
	for (let { start, end } of comments.reverse())
		code =
			code.slice(0, start) +
			code.slice(start, end).replace(/[^\n]/g, "") +
			code.slice(end);
	return code;
}

function getEmojis(text) {
	const emojiRegex = /\p{Extended_Pictographic}|\p{Emoji_Presentation}|[#*0-9]\uFE0F?\u20E3/u;

	return Array.from(
		GRAPHEME_SEGMENTER.segment(text),
		(it) => it.segment
	).filter((it) => emojiRegex.test(it));
}

function areUsingSameEmojis(baseText, newText) {
	const baseEmojis = getEmojis(baseText);
	const newEmojis = getEmojis(newText);

	if (baseEmojis.length !== newEmojis.length) return false;

	baseEmojis.sort();
	newEmojis.sort();

	return baseEmojis.join() === newEmojis.join();
}
