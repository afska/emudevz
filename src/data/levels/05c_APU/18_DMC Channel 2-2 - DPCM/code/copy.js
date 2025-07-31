["DPCM.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/apu/${file}`, level.bin[file]);
});
