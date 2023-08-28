filesystem.mkdirp(`${Drive.LIB_DIR}/cpu`);

["defineOperations.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/cpu/${file}`, level.bin[file]);
});
