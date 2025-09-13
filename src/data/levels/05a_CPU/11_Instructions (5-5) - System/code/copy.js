["interrupts.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/${file}`, level.bin[file]);
});

["interrupt_example.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/cpu/${file}`, level.bin[file]);
});
