filesystem.mkdirp(`${Drive.DOCS_DIR}/lib`);

["InMemoryRegister.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/${file}`, level.bin[file]);
});

copyLocalizedFile("InMemoryRegister.en.md", `${Drive.DOCS_DIR}/lib`);

copyLocalizedFile("video_registers.en.md", `${Drive.DOCS_DIR}/ppu`);

["VideoRegisters.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/ppu/${file}`, level.bin[file]);
});
