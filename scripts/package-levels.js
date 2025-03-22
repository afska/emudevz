const fs = require("fs");
const mkdirp = require("mkdirp");
const archiver = require("archiver");
const slug = require("slug");
const $path = require("path");
const _ = require("lodash");

const LEVELS_PATH = "src/data/levels";
const OUTPUT_PATH = "public/levels";
const GLOBAL_TEST_FOLDER = "$tests";
const GLOBAL_VIDEOTEST_FOLDER = "$videotests";
const LOCAL_TEST_FOLDER = "tests";
const LOCAL_CODE_FOLDER = "code";
const CHAPTER_HELP_FILES = { en: "$help/en.txt", es: "$help/es.txt" };
const CHAPTER_METADATA_FILE = "chapter.json";
const LEVEL_METADATA_FILE = "meta.json";
const BOOK_FILE = "book.json";
const PREFIX = "level_";
const EXTENSION = ".zip";
const FORMAT = "zip";
const COMPRESSION_LEVEL = 9;

const GLOBAL_TEST_PATH = $path.join(LEVELS_PATH, GLOBAL_TEST_FOLDER);
const GLOBAL_VIDEOTEST_PATH = $path.join(LEVELS_PATH, GLOBAL_VIDEOTEST_FOLDER);

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

	// global tests
	const globalTestFiles = fs.readdirSync(GLOBAL_TEST_PATH);

	// global videotests
	const globalVideoTestFiles = fs.readdirSync(GLOBAL_VIDEOTEST_PATH);

	// create output directory
	mkdirp.sync(OUTPUT_PATH);

	const chapterFolders = readDirs(LEVELS_PATH);
	for (let chapterFolder of chapterFolders) {
		const chapterPath = $path.join(LEVELS_PATH, chapterFolder);
		const [chapterId, chapterName] = chapterFolder.split("_");

		// parse chapter metadata
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
		const chapterNumber = parseInt(chapterHumanId.replace(/\D/g, ""));
		const isSpecialChapter = _.isNaN(chapterNumber);

		// chapter
		const chapter = {
			id: !isSpecialChapter ? globalChapterId : -1,
			number: !isSpecialChapter ? chapterNumber : chapterId,
			humanId: chapterHumanId,
			name: chapterMetadata.name,
			description: chapterMetadata.description || null,
			levels: [],
			help: _.mapValues(CHAPTER_HELP_FILES, (helpFile) => {
				try {
					return fs.readFileSync($path.join(chapterPath, helpFile)).toString();
				} catch (e) {
					return "";
				}
			}),
			isSpecial: isSpecialChapter,
		};
		book.chapters.push(chapter);

		let localLevelId = 0;
		const helpLines = [];
		const levelFolders = readDirs(chapterPath);
		for (let levelFolder of levelFolders) {
			const levelPath = $path.join(chapterPath, levelFolder);
			const [__, levelName] = levelFolder.split("_");

			// parse level metadata
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

			// build help lines
			if (levelMetadata.help?.addLines != null)
				helpLines.push(...levelMetadata.help.addLines);

			// level
			const id = slug((chapterName + "-" + levelName).replace(/_/g, " "));
			chapter.levels.push({
				id,
				humanId: `${chapter.humanId}.${localLevelId + 1}`,
				globalId: globalLevelId,
				name: levelMetadata.name,
				helpLines: _.sortBy([...helpLines]),
				unlocksGame: levelMetadata.letsPlayUnlock,
			});

			// create compressed file
			const outputPath = $path.join(OUTPUT_PATH, PREFIX + id + EXTENSION);
			const output = fs.createWriteStream(outputPath);
			const archive = archiver(FORMAT, {
				zlib: { level: COMPRESSION_LEVEL },
			});
			archive.pipe(output);
			await new Promise((resolve) => {
				output.on("close", function () {
					console.log("✅  " + id);
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

				// process test inheritance
				if (levelMetadata.test?.inherit != null) {
					// wildcards
					levelMetadata.test.inherit = levelMetadata.test.inherit.flatMap(
						(fileName) => {
							if (fileName.endsWith("*")) {
								const prefix = fileName.slice(0, -1);
								const matches = globalTestFiles.filter((it) =>
									it.startsWith(prefix)
								);
								return matches;
							}

							return fileName;
						}
					);

					// copy test files
					levelMetadata.test?.inherit.forEach((file) => {
						archive.file($path.join(GLOBAL_TEST_PATH, file), {
							name: $path.join(LOCAL_TEST_FOLDER, file),
						});
					});
				}

				// process videotest inheritance
				if (levelMetadata.videoTests?.length > 0) {
					const files = _(levelMetadata.videoTests).map("ppu").uniq().value();

					// copy videotest files
					files.forEach((file) => {
						archive.file($path.join(GLOBAL_VIDEOTEST_PATH, file), {
							name: $path.join(LOCAL_CODE_FOLDER, file),
						});
					});
				}

				// add content
				archive.directory(levelPath, false);

				// write compressed file
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
	console.log("✅  " + BOOK_FILE);
}

pkg();
