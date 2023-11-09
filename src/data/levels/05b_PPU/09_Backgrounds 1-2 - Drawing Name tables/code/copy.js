["background_rendering.en.md", "background_rendering.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/ppu/${file}`, level.bin[file]);
});
