filesystem.mkdirp(`${Drive.TMPL_DIR}/apu`);
filesystem.mkdirp(`${Drive.DOCS_DIR}/apu`);

["APU.js"].forEach((file) => {
	filesystem.write(`${Drive.TMPL_DIR}/apu/${file}`, level.bin[file]);
});
