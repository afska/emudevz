import filesystem from "./Filesystem";

const MAIN_FILE = "/code/index.js";
const CODE_DIR = "/code";
const SNAPSHOTS_DIR = "/snapshots";

export default {
	PATH_INVALID_CHARACTERS: /[^a-z0-9/._-]/gi,
	INVALID_CHARACTERS: /[^a-z0-9._-]/gi,
	MAX_FILE_NAME_LENGTH: 50,
	READONLY_PATHS: ["/", SNAPSHOTS_DIR],
	PROTECTED_PATHS: [MAIN_FILE],
	MAIN_FILE,
	CODE_DIR,
	SNAPSHOTS_DIR,

	init() {
		if (!filesystem.exists(CODE_DIR)) filesystem.mkdir(CODE_DIR);
		if (!filesystem.exists(MAIN_FILE)) filesystem.write(MAIN_FILE, "");
		if (!filesystem.exists(SNAPSHOTS_DIR)) filesystem.mkdir(SNAPSHOTS_DIR);
	},

	snapshotDirOf(levelId) {
		return `${SNAPSHOTS_DIR}/level-${levelId}`;
	},
};
