[
	"background_rendering.en.md",
	"background_rendering.es.md",
	"background_rendering.ru.md",
].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/ppu/${file}`, level.bin[file]);
});
