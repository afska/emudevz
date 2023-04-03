["example_instructions.js", "instructions.en.md", "instructions.es.md"].forEach(
	(file) => {
		filesystem.write(`${Drive.DOCS_DIR}/cpu/${file}`, level.bin[file]);
	}
);
