import _ from "lodash";
import Entry from "./Entry";

export class File extends Entry {
	constructor(name, parent, isReadOnly) {
		super(name, parent, isReadOnly);
	}
}
