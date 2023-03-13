try {
	filesystem.mkdir(`${Drive.DOCS_DIR}/cpu`);
} catch (e) {}

["cpu_memory.en.md", "cpu_memory.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/cpu/${file}`, level.bin[file]);
});
