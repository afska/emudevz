["instructions.en.md", "instructions.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/cpu/${file}`, level.bin[file]);
});

["instructions.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/cpu/${file}`, level.bin[file]);
});
