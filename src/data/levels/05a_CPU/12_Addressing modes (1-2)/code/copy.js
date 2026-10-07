[
	"addressing_modes.en.md",
	"addressing_modes.es.md",
	"addressing_modes.ru.md",
].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/cpu/${file}`, level.bin[file]);
});

["addressingModes.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/cpu/${file}`, level.bin[file]);
});
