["noisePeriods.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/apu/${file}`, level.bin[file]);
});

["noise_generation.en.md", "noise_generation.es.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/apu/${file}`, level.bin[file]);
});
