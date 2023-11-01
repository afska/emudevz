filesystem.mkdirp(`${Drive.LIB_DIR}/cpu`);

["interrupts.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/cpu/${file}`, level.bin[file]);
});
