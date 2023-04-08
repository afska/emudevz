const fs = require("fs");
const mkdirp = require("mkdirp");
const archiver = require("archiver");
const slug = require("slug");
const $path = require("path");
const _ = require("lodash");

const LEVELS_PATH = "src/data/levels";
const OUTPUT_PATH = "public/levels";
const GLOBAL_TEST_FOLDER = "$tests";
const LOCAL_TEST_FOLDER = "tests";
const CHAPTER_HELP_FILES = { en: "$help/en.txt", es: "$help/es.txt" };
const CHAPTER_METADATA_FILE = "chapter.json";
const LEVEL_METADATA_FILE = "meta.json";
const BOOK_FILE = "book.json";
const PREFIX = "level_";
const EXTENSION = ".zip";
const FORMAT = "zip";
const COMPRESSION_LEVEL = 9;

const GLOBAL_TEST_PATH = $path.join(LEVELS_PATH, GLOBAL_TEST_FOLDER);

function readDirs(path) {
	return _(fs.readdirSync(path, { withFileTypes: true }))
		.filter((it) => it.isDirectory())
		.map("name")
		.filter((it) => !it.startsWith("$"))
		.sortBy()
		.value();
}

async function pkg() {
	let globalLevelId = 0;
	let globalChapterId = 0;
	const book = { chapters: [] };

	mkdirp.sync(OUTPUT_PATH);

	const chapterFolders = readDirs(LEVELS_PATH);
	for (let chapterFolder of chapterFolders) {
		const chapterPath = $path.join(LEVELS_PATH, chapterFolder);
		const [chapterId, chapterName] = chapterFolder.split("_");

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

		const chapterHumanId = chapterId.replace(/^0+/, "");

		const chapter = {
			id: globalChapterId,
			number: parseInt(chapterHumanId.replace(/\D/g, "")),
			humanId: chapterHumanId,
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

		let localLevelId = 0;
		const helpLines = [];
		const levelFolders = readDirs(chapterPath);
		for (let levelFolder of levelFolders) {
			const levelPath = $path.join(chapterPath, levelFolder);
			const [__, levelName] = levelFolder.split("_");

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

			const id = slug((chapterName + "-" + levelName).replace(/_/g, " "));

			chapter.levels.push({
				id,
				humanId: `${chapter.humanId}.${localLevelId + 1}`,
				globalId: globalLevelId,
				name: levelMetadata.name,
				helpLines: _.sortBy([...helpLines]),
			});

			const outputPath = $path.join(OUTPUT_PATH, PREFIX + id + EXTENSION);
			const output = fs.createWriteStream(outputPath);
			const archive = archiver(FORMAT, {
				zlib: { level: COMPRESSION_LEVEL },
			});
			archive.pipe(output);

			await new Promise((resolve) => {
				output.on("close", function () {
					console.log("✔️  " + id);
					resolve();
				});

				archive.on("warning", function (err) {
					console.warn("⚠️  " + id);
					console.warn(err);
					process.exit(0);
				});

				archive.on("error", function (err) {
					console.error("❌  " + id);
					console.error(err);
					process.exit(0);
				});

				archive.directory(levelPath, false);
				if (levelMetadata.test?.inherit != null) {
					levelMetadata.test?.inherit.forEach((file) => {
						archive.file($path.join(GLOBAL_TEST_PATH, file), {
							name: $path.join(LOCAL_TEST_FOLDER, file),
						});
					});
				}
				archive.finalize();
			});

			globalLevelId++;
			localLevelId++;
		}

		globalChapterId++;
	}

	const serializedBook = JSON.stringify(book, null, 2);
	const bookPath = $path.join(OUTPUT_PATH, BOOK_FILE);
	fs.writeFileSync(bookPath, serializedBook);
	console.log("✔️  " + BOOK_FILE);
}

pkg();
