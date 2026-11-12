["noisePeriods.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/apu/${file}`, level.bin[file]);
});

copyLocalizedFile("noise_generation.en.md", `${Drive.DOCS_DIR}/apu`);
