copyLocalizedFile("ppu_memory.en.md", `${Drive.DOCS_DIR}/ppu`);

["PPUMemory.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/ppu/${file}`, level.bin[file]);
});
