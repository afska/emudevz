["cpu_example_instructions.js"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/${file}`, level.bin[file]);
});
