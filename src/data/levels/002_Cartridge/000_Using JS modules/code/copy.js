[
	["NEEEStest.neees", true],
	["NEEEStest.log", false],
].forEach(([file, binary]) => {
	const path = `${Drive.TESTROMS_DIR}/${file}`;

	if (!filesystem.exists(path))
		filesystem.write(path, level.bin[file], { binary });
});
