["Sprite.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/ppu/${file}`, level.bin[file]);
});

copyLocalizedFile("sprite_rendering.en.md", `${Drive.DOCS_DIR}/ppu`);
