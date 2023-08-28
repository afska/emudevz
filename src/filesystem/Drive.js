import Level from "../level/Level";
import filesystem from "./Filesystem";

const MAIN_FILE = "/code/index.js";
const CODE_DIR = "/code";
const LIB_DIR = "/lib";
const DOCS_DIR = "/docs";
const ROMS_DIR = "/roms";
const TMPL_DIR = "/tmpl";
const TESTROMS_DIR = "/roms/_test";
const SNAPSHOTS_DIR = "/.snapshots";
const READONLY_PATHS = [
	/^\/$/,
	/^\/\.snapshots.*/,
	/^\/$/,
	/^\/docs.*/,
	/^\/lib.*/,
	/^\/roms.*/,
];
const PROTECTED_PATHS = [MAIN_FILE];

export default {
	PATH_INVALID_CHARACTERS: /[^a-z0-9/._-]/gi,
	INVALID_CHARACTERS: /[^a-z0-9._-]/gi,
	MAX_FILE_NAME_LENGTH: 50,

	MAIN_FILE,
	CODE_DIR,
	LIB_DIR,
	DOCS_DIR,
	ROMS_DIR,
	TESTROMS_DIR,

	init(levelId) {
		filesystem.mkdirp(CODE_DIR);
		filesystem.mkdirp(LIB_DIR);
		filesystem.mkdirp(DOCS_DIR);
		filesystem.mkdirp(ROMS_DIR);
		filesystem.mkdirp(TMPL_DIR);
		filesystem.mkdirp(TESTROMS_DIR);
		filesystem.mkdirp(SNAPSHOTS_DIR);
		if (!filesystem.exists(MAIN_FILE)) filesystem.write(MAIN_FILE, "");

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
		if (window.SUDO) return false;
		if (Level.current.memory.content.protected) return true;
		path = filesystem.process(path);
		// ---

		return READONLY_PATHS.some((it) => it.test(path));
	},

	isProtectedFile(path) {
		if (window.SUDO) return false;
		if (Level.current.memory.content.protected) return true;
		path = filesystem.process(path);
		// ---

		return PROTECTED_PATHS.some((it) => it === path);
	},
};
