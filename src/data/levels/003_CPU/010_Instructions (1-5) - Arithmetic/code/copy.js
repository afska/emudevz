[
	"cpu_example_instructions.js",
	"cpu_instructions.en.md",
	"cpu_instructions.es.md",
].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/${file}`, level.bin[file]);
});
