["Sprite.js"].forEach((file) => {
	filesystem.write(`${Drive.LIB_DIR}/ppu/${file}`, level.bin[file]);
});

[
	"sprite_rendering.en.md",
	"sprite_rendering.es.md",
	"sprite_rendering.ru.md",
].forEach((file) => {
	filesystem.write(`${Drive.DOCS_DIR}/ppu/${file}`, level.bin[file]);
});
