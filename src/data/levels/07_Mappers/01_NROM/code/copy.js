["Mapper.en.md", "Mapper.es.md", "Mapper.ru.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/lib/${file}`, level.bin[file]);
});
