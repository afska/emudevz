filesystem.mkdirp(`${Drive.TMPL_DIR}/ppu`);
filesystem.mkdirp(`${Drive.DOCS_DIR}/ppu`);

["PPU.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/ppu/${file}`, level.bin[file]);
});

["rendering.png"].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/ppu/${file}`, level.media[file]);
});
