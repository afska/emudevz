const CODE_DIR = "/code";
const MAIN_FILE = "/code/index.js";

try {
	filesystem.stat(CODE_DIR);
} catch (e) {
	if (e.code === "ENOENT") {
		filesystem.mkdir(CODE_DIR);
	} else throw e;
}

try {
	filesystem.stat(MAIN_FILE);
} catch (e) {
	if (e.code === "ENOENT") {
		filesystem.write(MAIN_FILE, "");
	} else throw e;
}
