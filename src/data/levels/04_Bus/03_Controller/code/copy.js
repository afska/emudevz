copyLocalizedFile("controller.en.md", `${Drive.DOCS_DIR}`);

["Controller.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/${file}`, level.bin[file]);
});
