["ppu_memory.en.md", "ppu_memory.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/ppu/${file}`, level.bin[file]);
});

["PPUMemory.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/ppu/${file}`, level.bin[file]);
});
