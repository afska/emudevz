filesystem.mkdirp(`${Drive.DOCS_DIR}/cpu`);

copyLocalizedFile("cpu_memory.en.md", `${Drive.DOCS_DIR}/cpu`);

["CPUMemory.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/${file}`, level.bin[file]);
});
