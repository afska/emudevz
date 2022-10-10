const fs = require("fs");
const mkdirp = require("mkdirp");
const archiver = require("archiver");
const $path = require("path");
const _ = require("lodash");

const LEVELS_PATH = "src/data/levels";
const OUTPUT_PATH = "public/levels";
const CHAPTER_HELP_FILES = { en: "$help/en.txt", es: "$help/es.txt" };
const CHAPTER_METADATA_FILE = "chapter.json";
const LEVEL_METADATA_FILE = "meta.json";
const BOOK_FILE = "book.json";
const ID_LENGTH = 3;
const PREFIX = "level_";
const EXTENSION = ".zip";
const FORMAT = "zip";
const COMPRESSION_LEVEL = 9;

function readDirs(path) {
	return _(fs.readdirSync(path, { withFileTypes: true }))
		.filter((it) => it.isDirectory())
		.map("name")
		.sortBy()
		.value();
}

function isIdValid(id) {
	return id.length === ID_LENGTH && isFinite(parseInt(id));
}

function isNameValid(name) {
	return name != null && name.length > 0;
}

function formattedId(id) {
	return id.toString().padStart(ID_LENGTH, 0);
}

async function pkg() {
	let globalLevelId = 0;
	const book = { chapters: [] };

	mkdirp.sync(OUTPUT_PATH);

	const chapterFolders = readDirs(LEVELS_PATH);
	for (let chapterFolder of chapterFolders) {
		const chapterPath = $path.join(LEVELS_PATH, chapterFolder);
		const [chapterId, chapterName] = chapterFolder.split("_");
		if (!isIdValid(chapterId) || !isNameValid(chapterName)) {
			console.error(`❌ Invalid chapter folder name: ${chapterFolder}`);
			process.exit(0);
		}

		let chapterMetadata;
		try {
			const chapterJSON = fs
				.readFileSync($path.join(chapterPath, CHAPTER_METADATA_FILE))
				.toString();
			chapterMetadata = JSON.parse(chapterJSON);
		} catch (e) {
			console.error(`❌ Invalid chapter metadata: ${chapterFolder}`);
			console.error(e);
			process.exit(0);
		}

		const chapter = {
			name: chapterMetadata.name,
			levels: [],
			help: _.mapValues(CHAPTER_HELP_FILES, (helpFile) => {
				try {
					return fs.readFileSync($path.join(chapterPath, helpFile)).toString();
				} catch (e) {
					return "";
				}
			}),
		};
		book.chapters.push(chapter);

		const helpLines = [];
		const levelFolders = readDirs(chapterPath).filter(
			(it) => !it.startsWith("$")
		);
		for (let levelFolder of levelFolders) {
			const levelPath = $path.join(chapterPath, levelFolder);
			const [levelId, levelName] = levelFolder.split("_");
			if (!isIdValid(levelId) || !isNameValid(levelName)) {
				console.error(`❌ Invalid level folder name: ${levelFolder}`);
				process.exit(0);
			}

			let levelMetadata;
			try {
				const levelJSON = fs
					.readFileSync($path.join(levelPath, LEVEL_METADATA_FILE))
					.toString();
				levelMetadata = JSON.parse(levelJSON);
			} catch (e) {
				console.error(`❌ Invalid level metadata: ${chapterFolder}`);
				console.error(e);
				process.exit(0);
			}

			if (levelMetadata.help?.addLines != null)
				helpLines.push(...levelMetadata.help.addLines);

			chapter.levels.push({
				id: globalLevelId,
				name: levelMetadata.name,
				helpLines: _.sortBy([...helpLines]),
			});

			const outputPath = $path.join(
				OUTPUT_PATH,
				PREFIX + formattedId(globalLevelId) + EXTENSION
			);
			const output = fs.createWriteStream(outputPath);
			const archive = archiver(FORMAT, {
				zlib: { level: COMPRESSION_LEVEL },
			});
			archive.pipe(output);

			const slug = chapterFolder + "/" + levelFolder;

			await new Promise((resolve) => {
				output.on("close", function () {
					console.log("✔️  " + slug);
					resolve();
				});

				archive.on("warning", function (err) {
					console.warn("⚠️  " + slug);
					console.warn(err);
					process.exit(0);
				});

				archive.on("error", function (err) {
					console.error("❌  " + slug);
					process.error(err);
					process.exit(0);
				});

				archive.directory(levelPath, false);
				archive.finalize();

				globalLevelId++;
			});
		}
	}

	const serializedBook = JSON.stringify(book, null, 2);
	const bookPath = $path.join(OUTPUT_PATH, BOOK_FILE);
	fs.writeFileSync(bookPath, serializedBook);
	console.log("✔️  " + BOOK_FILE);
}

pkg();
