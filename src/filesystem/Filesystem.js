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
				...stat,
				name: it,
				filePath,
			};
		});

		return _.orderBy(content, ["isDirectory", "name"], ["desc", "asc"]);
	}

	lsr(path) {
		return this.ls(path).flatMap((it) => {
			return it.isDirectory ? this.lsr(`${path}/${it.name}`) : it;
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

	rmrf(path) {
		const files = this.ls(path);

		for (let file of files) {
			const filePath = `${path}/${file.name}`;

			if (file.isDirectory) this.rmrf(filePath);
			else this.rm(filePath);
		}

		this.rmdir(path);
	}

	mv(oldPath, newPath) {
		this.fs.renameSync(oldPath, newPath);
		store.dispatch.savedata.closeFile(oldPath);
	}

	exists(path) {
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
}
