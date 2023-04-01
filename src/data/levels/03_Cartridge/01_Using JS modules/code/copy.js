[
	["NEEEStest.neees", true],
	["golden.log", false],
].forEach(([file, binary]) => {
	const path = `${Drive.TESTROMS_DIR}/${file}`;
	filesystem.write(path, level.bin[file], { binary });
});

[["Conga.neees", true]].forEach(([file, binary]) => {
	const path = `${Drive.ROMS_DIR}/${file}`;
	filesystem.write(path, level.bin[file], { binary });
});

["assembly.asm"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/${file}`, level.bin[file]);
});
