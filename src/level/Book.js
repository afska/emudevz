import store from "../store";
import _ from "lodash";

export default class Book {
	constructor(metadata) {
		_.extend(this, metadata);
	}

	static get current() {
		return store.getState().book.instance;
	}

	getChapterOf(levelId) {
		return _.find(this.chapters, (chapter) => {
			return _.some(chapter.levels, (level) => level.id === levelId);
		});
	}
}
