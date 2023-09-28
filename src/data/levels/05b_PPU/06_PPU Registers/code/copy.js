["InMemoryRegister.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/${file}`, level.bin[file]);
});

["ppu_registers.en.md", "ppu_registers.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/ppu/${file}`, level.bin[file]);
});

["VideoRegisters.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/ppu/${file}`, level.bin[file]);
});
