["controller.en.md", "controller.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/${file}`, level.bin[file]);
});

["Controller.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/${file}`, level.bin[file]);
});
