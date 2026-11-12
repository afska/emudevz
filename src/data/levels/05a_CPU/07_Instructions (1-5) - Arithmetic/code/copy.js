copyLocalizedFile("instructions.en.md", `${Drive.DOCS_DIR}/cpu`);

["instructions.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/cpu/${file}`, level.bin[file]);
});
