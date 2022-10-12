class Entry {
	constructor(name, parent, isReadOnly = false) {
		this.name = name;
		this.parent = parent;
		this.isReadOnly = isReadOnly;
	}

	create() {
		this.parent?.addChild(this);
	}

	delete() {
		this.parent?.deleteChild(this.name);
	}
}
