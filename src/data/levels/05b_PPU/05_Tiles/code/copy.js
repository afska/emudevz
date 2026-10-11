[
	"tile_rendering.en.md",
	"tile_rendering.es.md",
	"tile_rendering.ru.md",
].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/ppu/${file}`, level.bin[file]);
});
