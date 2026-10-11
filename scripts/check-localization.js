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

	// Assembly help keeps the code and semicolon positions
	const helpPath = $path.join(LEVELS_DIR, "02_Assembly/$help");
	const helpFile = $path.join(helpPath, `${lang}.txt`);
	checkLines(
		fs.readFileSync($path.join(helpPath, "en.txt"), "utf8"),
		fs.readFileSync(helpFile, "utf8"),
		helpFile,
		lang,
		(line) => [
			line.split(";")[0],
			line.match(/`[^`]*`/g) || [],
			Array.from(line.matchAll(/;/g), (it) => it.index),
		]
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
			} catch {
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
					`Key ("name") for language "${lang}" in level metadata from "${chapterFolder}"/"${levelFolder}" should use the same emojis as the English version`
				);

			// Chat structure, formatting, and code match the English version
			const chatFile = $path.join(levelPath, `chat/${lang}.yml`);
			const chatEn = YAML.parse(
				fs.readFileSync($path.join(levelPath, "chat/en.yml"), "utf8")
			);
			let chat;
			try {
				chat = YAML.parse(fs.readFileSync(chatFile, "utf8"));
			} catch {
				throw new Error(`Chat file not found: ${chatFile}`);
			}
			checkChat(chatEn, chat, `${chapterFolder}/${levelFolder}`, lang);

			// Localized links have the same actions and appear in the chat
			const links = levelMetadata.ui?.components?.Main?.[1]?.links || [];
			const linkActions = ["en", lang].map((language) =>
				links
					.filter((it) => it.lang === language)
					.map((it) => _.omit(it, "text", "lang"))
			);
			if (!_.isEqual(linkActions[0], linkActions[1]))
				throw new Error(
					`Links differ from English\nLanguage: ${lang}\nLevel: ${levelPath}`
				);
			for (let link of links.filter((it) => it.lang === lang))
				if (
					!Object.values(chat).some((section) =>
						section.messages?.some((message) => message.includes(link.text))
					)
				)
					throw new Error(
						`Link text missing from chat\nLanguage: ${lang}\nFile: ${chatFile}\nText: ${link.text}`
					);

			// Check documentation files
			let docFiles = [];
			try {
				docFiles = fs
					.readdirSync($path.join(levelPath, "bin"))
					.filter((it) => it.endsWith(".md"));
			} catch {}
			if (docFiles.length) {
				const copyFile = $path.join(levelPath, "code/copy.js");
				const copiedFiles = Array.from(
					acorn.tokenizer(fs.readFileSync(copyFile, "utf8"), {
						ecmaVersion: "latest",
					}),
					(it) => it.value
				);
				for (let file of docFiles)
					if (!copiedFiles.includes(file))
						throw new Error(
							`Documentation file missing from ${copyFile}: ${file}`
						);
			}
			for (let file of docFiles.filter((it) => it.endsWith(".en.md"))) {
				const docFilePath = $path.join(levelPath, "bin", file);
				const enDocFile = fs.readFileSync(docFilePath).toString("utf-8");
				const localizedDocFilePath = docFilePath.replace(
					".en.md",
					`.${lang}.md`
				);

				let localizedDocFile;
				try {
					localizedDocFile = fs
						.readFileSync(localizedDocFilePath)
						.toString("utf-8");
				} catch {
					throw new Error(
						`Documentation file not found: ${localizedDocFilePath}`
					);
				}

				checkLines(
					enDocFile,
					localizedDocFile,
					localizedDocFilePath,
					lang,
					getDocumentationSignature
				);
			}
		}
	}
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

function checkLines(base, translated, location, lang, getSignature) {
	const [baseLines, translatedLines] = [base, translated].map((text) =>
		text.split(/\r?\n/)
	);
	const fail = (message, english, translation) => {
		throw new Error(
			`${message}\nLanguage: ${lang}\nFile: ${location}\nEnglish:\n${english}\nTranslation:\n${translation}`
		);
	};
	if (baseLines.length !== translatedLines.length)
		fail(
			"Line count differs from English",
			baseLines.length,
			translatedLines.length
		);

	for (let i = 0; i < baseLines.length; i++) {
		const signatures = [baseLines[i], translatedLines[i]].map(getSignature);
		if (!_.isEqual(signatures[0], signatures[1]))
			fail(
				`Content differs from English\nLine: ${i + 1}`,
				baseLines[i],
				translatedLines[i]
			);
	}
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

function getDocumentationSignature(line) {
	return [
		line.trim() === "",
		(
			line.match(/^\s*#+ |^\s*(?:[-+]|\d+\.) |`+|\*+|_+|~~|[<>|\[\]]/g) || []
		).sort(),
		line.match(/\bsrc="[^"]*"/g) || [],
		getEmojis(line),
	];
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
