["cpu_memory.en.md", "cpu_memory.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/${file}`, level.bin[file]);
});
