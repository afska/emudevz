filesystem.mkdirp(`${Drive.DOCS_DIR}/lib`);

["InMemoryRegister.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/${file}`, level.bin[file]);
});

["InMemoryRegister.en.md", "InMemoryRegister.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/lib/${file}`, level.bin[file]);
});

["video_registers.en.md", "video_registers.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/ppu/${file}`, level.bin[file]);
});

["VideoRegisters.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/ppu/${file}`, level.bin[file]);
});
