const fs = require("fs");
const mkdirp = require("mkdirp");
const archiver = require("archiver");
const $path = require("path");
const _ = require("lodash");

const LEVELS_PATH = "src/data/levels";
const OUTPUT_PATH = "public/levels";
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

async function package() {
	let globalLevelId = 0;
	const book = { chapters: [] };

	mkdirp.sync(OUTPUT_PATH);

	const chapterFolders = readDirs(LEVELS_PATH);
	for (let chapterFolder of chapterFolders) {
		const chapterPath = $path.join(LEVELS_PATH, chapterFolder);
		const [chapterId, chapterName] = chapterFolder.split("_");
		if (!isIdValid(chapterId) || !isNameValid(chapterName))
			throw new Error(`Invalid chapter folder name: ${chapterFolder}`);

		let chapterMetadata;
		try {
			const chapterJSON = fs
				.readFileSync($path.join(chapterPath, CHAPTER_METADATA_FILE))
				.toString();
			chapterMetadata = JSON.parse(chapterJSON);
		} catch (e) {
			throw new Error(`Invalid chapter metadata: ${chapterFolder}`);
		}

		const chapter = {
			name: chapterMetadata.name,
			levels: [],
		};
		book.chapters.push(chapter);

		const levelFolders = readDirs(chapterPath);
		for (let levelFolder of levelFolders) {
			const levelPath = $path.join(chapterPath, levelFolder);
			const [levelId, levelName] = levelFolder.split("_");
			if (!isIdValid(levelId) || !isNameValid(levelName))
				throw new Error(`Invalid level folder name: ${levelFolder}`);

			let levelMetadata;
			try {
				const levelJSON = fs
					.readFileSync($path.join(levelPath, LEVEL_METADATA_FILE))
					.toString();
				levelMetadata = JSON.parse(levelJSON);
			} catch (e) {
				throw new Error(`Invalid level metadata: ${chapterFolder}`);
			}

			chapter.levels.push({
				id: globalLevelId,
				name: levelMetadata.name,
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
					throw err;
				});

				archive.on("error", function (err) {
					console.error("❌  " + slug);
					throw err;
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

package();
