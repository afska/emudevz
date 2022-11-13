import filesystem from "./Filesystem";

const MAIN_FILE = "/code/index.js";
const CODE_DIR = "/code";
const SNAPSHOTS_DIR = "/.snapshots";
const READONLY_PATHS = [/^\/$/, /^\/\.snapshots.*/];
const PROTECTED_PATHS = [MAIN_FILE];

export default {
	PATH_INVALID_CHARACTERS: /[^a-z0-9/._-]/gi,
	INVALID_CHARACTERS: /[^a-z0-9._-]/gi,
	MAX_FILE_NAME_LENGTH: 50,

	MAIN_FILE,
	CODE_DIR,

	init() {
		if (!filesystem.exists(CODE_DIR)) filesystem.mkdir(CODE_DIR);
		if (!filesystem.exists(MAIN_FILE)) filesystem.write(MAIN_FILE, "");
		if (!filesystem.exists(SNAPSHOTS_DIR)) filesystem.mkdir(SNAPSHOTS_DIR);
	},

	snapshotDirOf(levelId) {
		return `${SNAPSHOTS_DIR}/level-${levelId}`;
	},

	isReadOnlyDir(absolutePath) {
		return READONLY_PATHS.some((it) => it.test(absolutePath));
	},

	isProtectedFile(absolutePath) {
		return PROTECTED_PATHS.some((it) => it === absolutePath);
	},
};
