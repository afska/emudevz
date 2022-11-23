const copy = (path, content) => {
	if (filesystem.exists(path)) return;

	filesystem.write(path, content);
};

["iNEEES.en.md", "iNEEES.es.md"].forEach((file) => {
	copy(`${Drive.DOCS_DIR}/${file}`, level.bin[file]);
});
["architecture.png"].forEach((file) => {
	copy(`${Drive.DOCS_DIR}/${file}`, level.media[file]);
});
