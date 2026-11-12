filesystem.mkdirp(`${Drive.DOCS_DIR}/lib`);

["InMemoryRegister.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/${file}`, level.bin[file]);
});

copyLocalizedFile("InMemoryRegister.en.md", `${Drive.DOCS_DIR}/lib`);

copyLocalizedFile("audio_registers.en.md", `${Drive.DOCS_DIR}/apu`);

["AudioRegisters.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/apu/${file}`, level.bin[file]);
});
