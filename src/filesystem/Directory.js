import _ from "lodash";
import Entry from "./Entry";
import {
	ENTRY_ALREADY_EXISTS,
	ENTRY_NOT_FOUND,
	PERMISSION_DENIED,
} from "./errors";

export default class Directory extends Entry {
	constructor(name, parent, isReadOnly) {
		super(name, parent, isReadOnly);

		this.children = [];
		this.isDirectory = true;
	}

	addChild(entry) {
		if (this.isReadOnly) throw PERMISSION_DENIED;
		if (this.getChild(entry.name) != null) throw ENTRY_ALREADY_EXISTS;

		this.children.push(entry);
	}

	deleteChild(entryName) {
		const child = this.getChild(entryName);
		if (child == null) throw ENTRY_NOT_FOUND;

		_.pull(this.children, child);
	}

	getChild(name) {
		return this.children.find((it) => it.name === name);
	}
}
