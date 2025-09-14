import escapeStringRegexp from "escape-string-regexp";
import $path from "path-browserify-esm";
import _ from "lodash";
import locales from "../locales";
import store from "../store";
import { blob } from "../utils";

const INDEXED_DB_STORE_NAME = "emudevz";
const HIDDEN_PREFIX = ".";
const MARKDOWN_POSTFIX = ".md";

class Filesystem {
	constructor() {
		this.load = (async () => {
			const BrowserFS = await import("browserfs");
			await new Promise((resolve, reject) => {
				BrowserFS.configure(
					{
						fs: "AsyncMirror",
						options: {
							sync: { fs: "InMemory" },
							async: {
								fs: "IndexedDB",
								options: { storeName: INDEXED_DB_STORE_NAME },
							},
						},
					},
					(e) => {
						if (e != null) {
							reject(e);
							return;
						}
						this.fs = BrowserFS.BFSRequire("fs");
						resolve();
					}
				);
			});
		})();

		this.symlinks = [];
	}

	setSymlinks(symlinks) {
		this.symlinks = symlinks;
	}

	withSymlinks(areSymlinksEnabled, action) {
		if (areSymlinksEnabled) {
			return action();
		} else {
			const symlinks = this.symlinks;
			this.symlinks = [];
			try {
				return action();
			} finally {
				this.symlinks = symlinks;
			}
		}
	}

	ls(path, displayPath = path) {
		const content = this.fs
			.readdirSync(this.process(path || "/"))
			.map((it) => {
				if (it.startsWith(HIDDEN_PREFIX)) return null; // (ignore dotfiles)
				if (
					it.endsWith(MARKDOWN_POSTFIX) &&
					!it.endsWith(`.${locales.language}${MARKDOWN_POSTFIX}`) &&
					it.split(".").length > 2
				) {
					return null; // (ignore non-localized markdown files)
				}

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

	lsrTree(path, filter = (name) => true) {
		return this.ls(this.process(path), path)
			.map((it) => {
				if (!it.isDirectory && !filter(it.name)) return null;

				it.children = it.isDirectory
					? this.lsrTree(`${path}/${it.name}`, filter)
					: [];
				return it;
			})
			.filter((it) => it != null)
			.filter((it) => !it.isDirectory || it.children.length > 0);
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

		if (options.parents) {
			const parsedPath = $path.parse(path);
			const parent = parsedPath.dir;
			this.mkdirp(parent);
		}

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
		const stat = this.stat(dirPath);
		if (!stat.isDirectory) return this.cp(dirPath, newDirPath);
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

	mkdirp(path) {
		path = this.process(path);
		// ---

		try {
			let success = false;
			do {
				try {
					this.fs.mkdirSync(path);
					success = true;
				} catch (e) {
					if (e.code === "ENOENT") {
						this.mkdirp(e.path);
						continue;
					}

					throw e;
				}
			} while (!success);
		} catch (e) {
			if (e.code === "EEXIST") return;

			throw e;
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

	rmrff(path) {
		try {
			this.rmrf(path);
		} catch (e) {
			if (e.code === "ENOTDIR") this.rm(path);
		}
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

	normalize(path, workingDirectory = "/") {
		return this.process(this.resolve(path, workingDirectory));
	}

	resolve(path, workingDirectory) {
		$path.setCWD(workingDirectory);
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
