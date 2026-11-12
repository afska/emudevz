const fs = require("fs");
const archiver = require("archiver");
const JSON5 = require("json5");
const $path = require("path");
const { execSync } = require("child_process");
const { parseArgs } = require("util");
const _ = require("lodash");
const getTests = require("./_tests");

const FORMAT_VERSION = 1;

const TYPE = "emudevz-lang-pack";
const EXTENSION = ".emudevz-lang";
const LOCALES_DIR = "src/data/locales";
const DICTIONARY_FILE = "src/data/dictionaryEntries.js";
const LEVELS_DIR = "src/data/levels";
const ASSEMBLY_HELP_DIR = "src/data/levels/02_Assembly/$help";
const ASSEMBLY_HELP_FILE = "levels/assembly_help.txt";
const CHAPTER_METADATA_FILE = "chapter.json";
const LEVEL_METADATA_FILE = "meta.json";
const COMPRESSION_LEVEL = 9;

async function generate() {
	const { code, name, version } = getArgs();

	try {
		execSync(`node scripts/check-localization.js ${code}`, {
			stdio: "inherit",
		});
	} catch {
		throw new Error("Localization check failed. Fix the errors above first.");
	}

	const locales = getObject(`${LOCALES_DIR}/${code}.js`);
	const dictionary = _.mapValues(getObject(DICTIONARY_FILE), (entry) => ({
		also: entry.also?.[code],
		definition: entry[code],
		version: entry.version,
	}));
	const tests = _(getTests())
		.map((test) => [test.name, test.locales[code]])
		.fromPairs()
		.value();

	const outputPath = code + EXTENSION;
	const output = fs.createWriteStream(outputPath);
	const archive = archiver("zip", { zlib: { level: COMPRESSION_LEVEL } });
	const done = new Promise((resolve, reject) => {
		output.on("close", resolve);
		archive.on("warning", reject);
		archive.on("error", reject);
	});
	archive.pipe(output);

	addJSON(archive, "lang.json", {
		type: TYPE,
		code,
		name,
		format: FORMAT_VERSION,
		version,
	});
	addJSON(archive, "locales.json", locales);
	addJSON(archive, "dictionary.json", dictionary);
	addJSON(archive, "tests.json", tests);

	// levels
	for (let chapterFolder of readDirs(LEVELS_DIR)) {
		const chapterPath = $path.join(LEVELS_DIR, chapterFolder);
		const chapterOutputPath = `levels/${chapterFolder}`;

		const chapterMetadata = readJSON(
			$path.join(chapterPath, CHAPTER_METADATA_FILE)
		);
		addJSON(archive, `${chapterOutputPath}/${CHAPTER_METADATA_FILE}`, {
			name: chapterMetadata.name[code],
			description: chapterMetadata.description?.[code],
		});

		for (let levelFolder of readDirs(chapterPath)) {
			const levelPath = $path.join(chapterPath, levelFolder);
			const levelOutputPath = `${chapterOutputPath}/${levelFolder}`;

			const levelMetadata = readJSON(
				$path.join(levelPath, LEVEL_METADATA_FILE)
			);
			addJSON(archive, `${levelOutputPath}/${LEVEL_METADATA_FILE}`, {
				name: levelMetadata.name[code],
				version: levelMetadata.version,
			});

			archive.file($path.join(levelPath, `chat/${code}.yml`), {
				name: `${levelOutputPath}/chat.yml`,
			});

			for (let file of readFiles($path.join(levelPath, "bin")))
				if (file.endsWith(`.${code}.md`))
					archive.file($path.join(levelPath, "bin", file), {
						name: `${levelOutputPath}/bin/${file}`,
					});
		}
	}
	archive.file($path.join(ASSEMBLY_HELP_DIR, `${code}.txt`), {
		name: ASSEMBLY_HELP_FILE,
	});

	archive.finalize();
	await done;

	console.log(`✅  Generated: ${outputPath} (${name} v${version})`);
}

generate().catch((err) => {
	console.error("❌  " + err.message);
	process.exitCode = 1;
});

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

function getArgs() {
	const { values } = parseArgs({
		options: {
			code: { type: "string" },
			name: { type: "string" },
			version: { type: "string" },
		},
	});

	if (!/^[a-z]{2}$/.test(values.code ?? ""))
		throw new Error("`--code` must be a two-letter language code (e.g. `ja`)");
	if (!values.name?.trim())
		throw new Error("`--name` is required (e.g. `Japanese`)");
	if (!/^\d+$/.test(values.version ?? ""))
		throw new Error("`--version` must be an integer (e.g. `1`)");

	return {
		code: values.code,
		name: values.name.trim(),
		version: parseInt(values.version),
	};
}

function addJSON(archive, name, content) {
	archive.append(JSON.stringify(content, null, "\t"), { name });
}

function readDirs(path) {
	return _(fs.readdirSync(path, { withFileTypes: true }))
		.filter((it) => it.isDirectory())
		.map("name")
		.filter((it) => !it.startsWith("$"))
		.sortBy()
		.value();
}

function readFiles(path) {
	try {
		return fs.readdirSync(path);
	} catch {
		return [];
	}
}

function readJSON(filePath) {
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch {
		throw new Error(`Invalid JSON file: ${filePath}`);
	}
}

function getObject(filePath, regexp = /^export default (.+);/s) {
	let file;
	try {
		file = fs.readFileSync(filePath, "utf8");
	} catch {
		throw new Error(`File not found: ${filePath}`);
	}

	try {
		return JSON5.parse(file.match(regexp)[1]);
	} catch {
		throw new Error(`Unable to parse object from file: ${filePath}`);
	}
}
