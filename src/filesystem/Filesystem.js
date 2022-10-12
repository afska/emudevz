export default class Filesystem {
	constructor() {
		const BrowserFS = require("browserfs");

		BrowserFS.configure({ fs: "LocalStorage" }, (e) => {
			if (e != null) throw new Error("Failed to initialized BrowserFS");
			this.fs = BrowserFS.BFSRequire("fs");
		});
	}

	ls(path) {
		return this.fs.readdirSync(path).map((it) => {
			return {
				name: it,
				isDirectory: this.stat(`${path}/${it}`).isDirectory(),
			};
		});
	}

	read(path) {
		return this.fs.readFileSync(path).toString();
	}

	write(path, data) {
		this.fs.writeFileSync(path, data);
	}

	mkdir(path) {
		this.fs.mkdirSync(path);
	}

	rm(path) {
		this.fs.unlinkSync(path);
	}

	rmdir(path) {
		this.fs.rmdirSync(path);
	}

	mv(oldPath, newPath) {
		this.fs.renameSync(oldPath, newPath);
	}

	stat(path) {
		return this.fs.statSync(path);
	}
}
