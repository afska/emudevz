import _ from "lodash";
import store from "../store";

export default class Book {
	constructor(metadata) {
		_.extend(this, metadata);
	}

	static get current() {
		return store.getState().book.instance;
	}

	get maxLevelId() {
		return _(this.chapters).flatMap("levels").map("id").max();
	}

	getChapterOf(levelId) {
		const index = _.findIndex(this.chapters, (chapter) => {
			return _.some(chapter.levels, (level) => level.id === levelId);
		});
		const chapter = this.chapters[index];
		if (!chapter) return null;

		chapter.number = index + 1;
		return chapter;
	}

	getLevelDefinitionOf(levelId) {
		const chapter = this.getChapterOf(levelId);
		const levelDefinition = chapter.levels.find(
			(level) => level.id === levelId
		);
		if (!levelDefinition) return null;

		return levelDefinition;
	}
}
