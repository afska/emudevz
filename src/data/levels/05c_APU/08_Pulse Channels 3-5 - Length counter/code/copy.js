filesystem.mkdirp(`${Drive.LIB_DIR}/apu`);

["noteLengths.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/apu/${file}`, level.bin[file]);
});
