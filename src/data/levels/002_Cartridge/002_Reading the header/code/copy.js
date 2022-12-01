["iNEEES.en.md", "iNEEES.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/${file}`, level.bin[file]);
});
["architecture.png", "cartridge.png"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/${file}`, level.media[file]);
});
