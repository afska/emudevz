import $path from "path";
import _ from "lodash";
import store from "../store";

export default class Filesystem {
	constructor() {
		const BrowserFS = require("browserfs");

		BrowserFS.configure({ fs: "LocalStorage" }, (e) => {
			if (e != null) throw new Error("Failed to initialized BrowserFS");
			this.fs = BrowserFS.BFSRequire("fs");
		});
	}

	ls(path) {
		const content = this.fs.readdirSync(path).map((it) => {
			const filePath = `${path}/${it}`;
			const stat = this.stat(filePath);

			return {
				name: it,
				isDirectory: stat.isDirectory(),
				size: stat.size,
				filePath,
				dirPath: path,
			};
		});

		return _.orderBy(content, ["isDirectory", "name"], ["desc", "asc"]);
	}

	lsr(path) {
		return this.ls(path).flatMap((it) => {
			return it.isDirectory ? this.ls(`${path}/${it.name}`) : it;
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

		store.dispatch.savedata.closeFile(path);
	}

	rmdir(path) {
		this.fs.rmdirSync(path);
	}

	rimraf(path) {
		const files = this.ls(path);

		for (let file of files) {
			const filePath = `${path}/${file.name}`;

			if (file.isDirectory) this.rimraf(filePath);
			else this.rm(filePath);
		}

		this.rmdir(path);
	}

	mv(oldPath, newPath) {
		this.stat(oldPath);
		try {
			const newPathStat = this.stat(newPath);
			if (newPathStat.isDirectory()) newPath += "/" + $path.parse(oldPath).base;
		} catch (e) {
			if (e.code !== "ENOENT") throw e;
		}
		this.fs.renameSync(oldPath, newPath);

		store.dispatch.savedata.closeFile(oldPath);
	}

	stat(path) {
		return this.fs.statSync(path);
	}
}
