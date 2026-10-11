["definitions.en.md", "definitions.es.md", "definitions.ru.md"].forEach(
	(file) => {
		filesystem.write(`${Drive.DOCS_DIR}/ppu/${file}`, level.bin[file]);
	}
);
