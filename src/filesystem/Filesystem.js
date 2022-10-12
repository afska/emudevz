import _ from "lodash";
import store from "../store";
import Directory from "./Directory";

export default class Filesystem {
	constructor() {
		this.metadata = this._load(store.getState().files.filesystem);
	}

	_load(obj) {
		if (obj.isDirectory) {
			const directory = new Directory(obj.path, obj.parent, obj.isReadOnly);
			directory.children = obj.children.map((it) => this._load(it));
		} else {
			return new File(obj.path, obj.parent, obj.isReadOnly);
		}
	}
}
