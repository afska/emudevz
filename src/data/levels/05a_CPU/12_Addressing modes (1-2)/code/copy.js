copyLocalizedFile("addressing_modes.en.md", `${Drive.DOCS_DIR}/cpu`);

["addressingModes.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/cpu/${file}`, level.bin[file]);
});
