filesystem.mkdirp(`${Drive.TMPL_DIR}/mappers`);

["0_NROM.js", "mappers.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/mappers/${file}`, level.bin[file]);
});

["Emulator.js", "saveStates.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/${file}`, level.bin[file]);
});

["Mapper.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/${file}`, level.bin[file]);
});
