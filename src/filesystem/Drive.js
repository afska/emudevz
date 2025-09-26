import Book from "../level/Book";
import Level from "../level/Level";
import filesystem from "./Filesystem";

const MAIN_FILE = "/code/index.js";
const CODE_DIR = "/code";
const LIB_DIR = "/lib";
const DOCS_DIR = "/docs";
const ROMS_DIR = "/roms";
const SAVE_DIR = "/sav";
const TMPL_DIR = "/tmpl";
const USR_DIR = "/usr";
const ALLROMS_DIR = "/roms/.all";
const TESTROMS_DIR = "/roms/_test";
const SNAPSHOTS_DIR = "/.snapshots";
const FREE_DIR = "/.free";
const READONLY_PATHS = [
	/^\/$/,
	/^\/\.free$/,
	/^\/\.snapshots.*/,
	/^\/docs.*/,
	/^\/lib.*/,
	/^\/roms.*/,
	/^\/tmpl.*/,
];
const PROTECTED_PATHS = [];

export default {
	PATH_INVALID_CHARACTERS: /[^a-z0-9/._-]/gi,
	INVALID_CHARACTERS: /[^a-z0-9._-]/gi,
	MAX_FILE_NAME_LENGTH: 50,

	MAIN_FILE,
	CODE_DIR,
	LIB_DIR,
	DOCS_DIR,
	ROMS_DIR,
	SAVE_DIR,
	TMPL_DIR,
	USR_DIR,
	ALLROMS_DIR,
	TESTROMS_DIR,
	SNAPSHOTS_DIR,
	FREE_DIR,

	init(levelId) {
		const isFreeMode = levelId === Book.FREE_MODE_LEVEL;

		if (isFreeMode) {
			filesystem.mkdirp(FREE_DIR + CODE_DIR);
			filesystem.mkdirp(FREE_DIR + SAVE_DIR);
			filesystem.mkdirp(FREE_DIR + TMPL_DIR);
			filesystem.mkdirp(FREE_DIR + USR_DIR);
			if (!filesystem.exists(FREE_DIR + MAIN_FILE))
				filesystem.write(FREE_DIR + MAIN_FILE, "");
			filesystem.setSymlinks([]);
			return { isUsingSnapshot: false };
		}

		filesystem.mkdirp(CODE_DIR);
		filesystem.mkdirp(LIB_DIR);
		filesystem.mkdirp(DOCS_DIR);
		filesystem.mkdirp(ROMS_DIR);
		filesystem.mkdirp(SAVE_DIR);
		filesystem.mkdirp(TMPL_DIR);
		filesystem.mkdirp(USR_DIR);
		filesystem.mkdirp(ALLROMS_DIR);
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
		if (window.ROOT_USER) return false;
		if (Level.current.memory.content.protected) return true;
		path = filesystem.process(path);
		// ---

		return READONLY_PATHS.some((it) => it.test(path));
	},

	isProtectedFile(path) {
		if (window.ROOT_USER) return false;
		if (Level.current.memory.content.protected) return true;
		path = filesystem.process(path);
		// ---

		return PROTECTED_PATHS.some((it) => it === path);
	},
};
