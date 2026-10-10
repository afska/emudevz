const fs = require("fs");
const JSON5 = require("json5");
const _ = require("lodash");

const LANGUAGES = ["es", "ru"];

const LOCALES_DIR = "src/data/locales";
const LOCALES_MAIN_FILE = "src/locales.js";
const DATA_DIR = "src/data";

console.log("Checking localization consistency...");

const localesMainFile = fs.readFileSync(LOCALES_MAIN_FILE).toString("utf-8");
const enLocales = getLocales("en");
const enKeyCount = getKeyCount(enLocales);
const dictionary = getDictionary();

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

	console.log(dictionary);

	// TODO: Check dictionary
	// TODO: Check chat scripts
	// TODO: Check documentation
	// TODO: Check meta files
	// TODO: Check FAQ's links
}

console.log("All seems fine!");

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

function getLocales(lang) {
	return getObject(`${LOCALES_DIR}/${lang}.js`);
}

function getDictionary() {
	return getObject(`${DATA_DIR}/dictionaryEntries.js`);
}

function ensureKeyExists(lang, locales, key) {
	if (typeof locales[key] !== "string")
		throw new Error(`Missing key "${key}" in language "${lang}"`);
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
