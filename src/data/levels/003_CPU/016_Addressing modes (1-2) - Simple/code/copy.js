[
	"example_addressing_modes.js",
	"addressing_modes.en.md",
	"addressing_modes.es.md",
].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/cpu/${file}`, level.bin[file]);
});
