["index.js", "index.test.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/${file}`, level.bin[file]);

	const fullPath = `${Drive.CODE_DIR}/${file}`;
	if (filesystem.exists(fullPath)) {
		const content = filesystem.read(fullPath);
		if (content == "") {
			filesystem.write(fullPath, level.bin[file]);
		}
	}
});
