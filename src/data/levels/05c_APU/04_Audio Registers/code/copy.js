["InMemoryRegister.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/${file}`, level.bin[file]);
});

["audio_registers.en.md", "audio_registers.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/apu/${file}`, level.bin[file]);
});

["AudioRegisters.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/apu/${file}`, level.bin[file]);
});
