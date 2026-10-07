[
	"suggested_improvements.en.md",
	"suggested_improvements.es.md",
	"suggested_improvements.ru.md",
].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/${file}`, level.bin[file]);
});
