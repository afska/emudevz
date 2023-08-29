filesystem.mkdirp(`${Drive.TMPL_DIR}/ppu`);

["PPU.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/ppu/${file}`, level.bin[file]);
});
