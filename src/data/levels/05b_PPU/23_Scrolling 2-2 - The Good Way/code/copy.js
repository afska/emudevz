["LoopyRegister.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/ppu/${file}`, level.bin[file]);
});
