const fs = require("fs");
const rimraf = require("rimraf");
const mkdirp = require("mkdirp");
const archiver = require("archiver");
const $path = require("path");

const LEVELS_PATH = "src/data/levels";
const OUTPUT_PATH = "public/levels";
const LEVEL_ID_LENGTH = 3;
const PREFIX = "level_";
const EXTENSION = ".zip";
const FORMAT = "zip";
const COMPRESSION_LEVEL = 9;

rimraf.sync(OUTPUT_PATH);
mkdirp.sync(OUTPUT_PATH);

const levelFolders = fs.readdirSync(LEVELS_PATH);

levelFolders.forEach((levelFolder) => {
	const levelPath = $path.join(LEVELS_PATH, levelFolder);
	const id = levelFolder.split("_")[0];

	if (id.length !== LEVEL_ID_LENGTH || !isFinite(parseInt(id)))
		throw new Error(`Invalid folder name: ${levelFolder}`);

	const outputPath = $path.join(OUTPUT_PATH, PREFIX + id + EXTENSION);
	const output = fs.createWriteStream(outputPath);
	const archive = archiver(FORMAT, {
		zlib: { level: COMPRESSION_LEVEL },
	});
	archive.pipe(output);

	output.on("close", function () {
		console.log("✔️  " + levelFolder);
	});

	archive.on("warning", function (err) {
		console.warn("⚠️  " + levelFolder);
		throw err;
	});

	archive.on("error", function (err) {
		console.error("❌  " + levelFolder);
		throw err;
	});

	archive.directory(levelPath, false);
	archive.finalize();
});
