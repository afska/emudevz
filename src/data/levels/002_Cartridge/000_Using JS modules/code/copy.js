[
	["NEEEStest.neees", true],
	["NEEEStest.log", false],
].forEach(([file, binary]) => {
	const path = `${Drive.TESTROMS_DIR}/${file}`;
	filesystem.write(path, level.bin[file], { binary });
});

filesystem.write(`${Drive.DOCS_DIR}/assembly.asm`, level.bin["assembly.asm"]);
