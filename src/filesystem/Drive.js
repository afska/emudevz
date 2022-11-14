import filesystem from "./Filesystem";

const MAIN_FILE = "/code/index.js";
const CODE_DIR = "/code";
const ROMS_DIR = "/roms";
const TESTROMS_DIR = "/roms/test";
const SNAPSHOTS_DIR = "/.snapshots";
const READONLY_PATHS = [/^\/$/, /^\/\.snapshots.*/, /^\/$/, /^\/roms.*/];
const PROTECTED_PATHS = [MAIN_FILE];

export default {
	PATH_INVALID_CHARACTERS: /[^a-z0-9/._-]/gi,
	INVALID_CHARACTERS: /[^a-z0-9._-]/gi,
	MAX_FILE_NAME_LENGTH: 50,

	MAIN_FILE,
	CODE_DIR,
	TESTROMS_DIR,

	init(levelId) {
		if (!filesystem.exists(CODE_DIR)) filesystem.mkdir(CODE_DIR);
		if (!filesystem.exists(ROMS_DIR)) filesystem.mkdir(ROMS_DIR);
		if (!filesystem.exists(TESTROMS_DIR)) filesystem.mkdir(TESTROMS_DIR);
		if (!filesystem.exists(MAIN_FILE)) filesystem.write(MAIN_FILE, "");
		if (!filesystem.exists(SNAPSHOTS_DIR)) filesystem.mkdir(SNAPSHOTS_DIR);

		const snapshotDir = this.snapshotDirOf(levelId);
		const isUsingSnapshot = filesystem.exists(snapshotDir);
		filesystem.setSymlinks(
			isUsingSnapshot
				? [
						{
							from: CODE_DIR,
							to: snapshotDir,
						},
				  ]
				: []
		);

		return { isUsingSnapshot };
	},

	snapshotDirOf(levelId) {
		return `${SNAPSHOTS_DIR}/level-${levelId}`;
	},

	isReadOnlyDir(path) {
		if (window.DEBUG) return false;
		path = filesystem.process(path);
		// ---

		return READONLY_PATHS.some((it) => it.test(path));
	},

	isProtectedFile(path) {
		if (window.DEBUG) return false;
		path = filesystem.process(path);
		// ---

		return PROTECTED_PATHS.some((it) => it === path);
	},
};
