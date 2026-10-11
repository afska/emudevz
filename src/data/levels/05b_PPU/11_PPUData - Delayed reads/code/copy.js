["ppudata_example.md"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/ppu/${file}`, level.bin[file]);
});
