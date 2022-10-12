import _ from "lodash";
import Entry from "./Entry";

export default class File extends Entry {
	constructor(name, parent, isReadOnly) {
		super(name, parent, isReadOnly);
	}
}
