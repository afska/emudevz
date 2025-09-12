filesystem.mkdirp(`${Drive.DOCS_DIR}/cpu`);

["cpu_memory.en.md", "cpu_memory.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/cpu/${file}`, level.bin[file]);
});

["CPUMemory.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/${file}`, level.bin[file]);
});
