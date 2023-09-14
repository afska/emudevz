["tile_rendering.en.md", "tile_rendering.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/ppu/${file}`, level.bin[file]);
});
