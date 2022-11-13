const MAIN_FILE = "/code/index.js";

export default {
	PATH_INVALID_CHARACTERS: /[^a-z0-9/._-]/gi,
	INVALID_CHARACTERS: /[^a-z0-9._-]/gi,
	MAX_FILE_NAME_LENGTH: 50,
	READONLY_PATHS: ["/", "/media", "/roms"],
	PROTECTED_PATHS: [MAIN_FILE],
	MAIN_FILE,
};
