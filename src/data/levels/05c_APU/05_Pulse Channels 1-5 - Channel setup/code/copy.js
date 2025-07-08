["PulseChannel.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/apu/${file}`, level.bin[file]);
});
