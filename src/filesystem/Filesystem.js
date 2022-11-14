import escapeStringRegexp from "escape-string-regexp";
import $path from "path";
import _ from "lodash";
import store from "../store";
import { blob } from "../utils";

const HIDDEN_PREFIX = ".";

class Filesystem {
	constructor() {
		const BrowserFS = require("browserfs");

		BrowserFS.configure({ fs: "LocalStorage" }, (e) => {
			if (e != null) throw new Error("Failed to initialized BrowserFS");
			this.fs = BrowserFS.BFSRequire("fs");
		});

		this.symlinks = [];
	}

	setSymlinks(symlinks) {
		this.symlinks = symlinks;
	}

	ls(path, displayPath = path) {
		const content = this.fs
			.readdirSync(this.process(path))
			.map((it) => {
				if (it.startsWith(HIDDEN_PREFIX)) return null;

				const filePath = `${path}/${it}`;
				const displayFilePath = `${displayPath}/${it}`;
				const stat = this.stat(filePath);

				return {
					...stat,
					name: it,
					filePath: displayFilePath,
				};
			})
			.filter((it) => it != null);

		return _.orderBy(content, ["isDirectory", "name"], ["desc", "asc"]);
	}

	lsr(path) {
		return this.ls(this.process(path), path).flatMap((it) => {
			return it.isDirectory ? this.lsr(`${path}/${it.name}`) : it;
		});
	}

	read(path, options = {}) {
		path = this.process(path);
		// ---

		let data = this.fs.readFileSync(path).toString();
		if (options.binary) data = blob.base64ToArrayBuffer(data);

		return data;
	}

	write(path, data, options = {}) {
		path = this.process(path);
		// ---

		if (options.binary) data = blob.arrayBufferToBase64(data);
		else if (data instanceof ArrayBuffer) data = new TextDecoder().decode(data);

		this.fs.writeFileSync(path, data);
	}

	cp(filePath, newFilePath) {
		filePath = this.process(filePath);
		newFilePath = this.process(newFilePath);
		// ---

		const content = this.read(filePath);
		this.write(newFilePath, content);
	}

	cpr(dirPath, newDirPath) {
		dirPath = this.process(dirPath);
		newDirPath = this.process(newDirPath);
		// ---

		this.mkdir(newDirPath);

		const files = this.ls(dirPath);
		for (let entry of files) {
			const name = $path.parse(entry.filePath).base;
			const newPath = `${newDirPath}/${name}`;

			if (entry.isDirectory) this.cpr(entry.filePath, newPath);
			else this.cp(entry.filePath, newPath);
		}
	}

	mkdir(path) {
		path = this.process(path);
		// ---

		this.fs.mkdirSync(path);
	}

	rm(path) {
		path = this.process(path);
		// ---

		store.dispatch.savedata.closeFile(path);
		this.fs.unlinkSync(path);
	}

	rmdir(path) {
		path = this.process(path);
		// ---

		this.fs.rmdirSync(path);
	}

	rmrf(path) {
		path = this.process(path);
		// ---

		const files = this.ls(path);

		for (let file of files) {
			const filePath = `${path}/${file.name}`;

			if (file.isDirectory) this.rmrf(filePath);
			else this.rm(filePath);
		}

		this.rmdir(path);
	}

	mv(oldPath, newPath) {
		oldPath = this.process(oldPath);
		newPath = this.process(newPath);
		// ---

		store.dispatch.savedata.closeFile(oldPath);
		this.fs.renameSync(oldPath, newPath);
	}

	exists(path) {
		path = this.process(path);
		// ---

		try {
			this.stat(path);
			return true;
		} catch (e) {
			if (e.code === "ENOENT") {
				return false;
			} else throw e;
		}
	}

	stat(path) {
		path = this.process(path);
		// ---

		const stat = this.fs.statSync(path);

		return {
			isDirectory: stat.isDirectory(),
			size: stat.size,
		};
	}

	resolve(path, workingDirectory) {
		process.$setCwd(workingDirectory);
		return $path.resolve(path);
	}

	process(path) {
		path = path.replace(/\/\//g, "/");

		for (let symlink of this.symlinks)
			path = path.replace(
				new RegExp("^" + escapeStringRegexp(symlink.from), "g"),
				symlink.to
			);

		return path;
	}
}

export default new Filesystem();
