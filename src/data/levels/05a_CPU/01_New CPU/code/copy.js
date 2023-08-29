filesystem.mkdirp(`${Drive.TMPL_DIR}/cpu`);

["CPU.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/cpu/${file}`, level.bin[file]);
});
