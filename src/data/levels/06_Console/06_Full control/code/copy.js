filesystem.mkdirp(`${Drive.TMPL_DIR}/mappers`);
filesystem.mkdirp(`${Drive.TMPL_DIR}/tests`);

["0_NROM.js", "mappers.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/mappers/${file}`, level.bin[file]);
});

["Emulator.js", "saveStates.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/${file}`, level.bin[file]);
});

["Mapper.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/${file}`, level.bin[file]);
});

for (let fileName in level.tests) {
	const newName = fileName.replace(".js", "") + ".test.js";
	const content = level.tests[fileName].replace(
		/^([ \t]*)locales: \{\r?\n[\s\S]*?^\1\},\r?\n/gm,
		""
	); // (remove test name localizations)
	filesystem.write(`${Drive.TMPL_DIR}/tests/${newName}`, content);
}
