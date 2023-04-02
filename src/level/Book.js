import _ from "lodash";
import store from "../store";

export default class Book {
	constructor(metadata) {
		_.extend(this, metadata);
	}

	static get current() {
		return store.getState().book.instance;
	}

	getId(humanId) {
		for (let chapter of this.chapters) {
			for (let level of chapter.levels) {
				if (level.humanId === humanId) return level.id;
			}
		}

		return null;
	}

	isUnlocked(levelId, maxLevelId) {
		const maxLevel = this.getLevelDefinitionOf(maxLevelId);
		const level = this.getLevelDefinitionOf(levelId);

		return maxLevel.globalId >= level.globalId;
	}

	nextIdOf(maxLevelId) {
		const maxLevel = this.getLevelDefinitionOf(maxLevelId);
		const nextLevel = this.getLevelDefinitionOfGlobalId(maxLevel.globalId + 1);
		if (!nextLevel) return null;

		return nextLevel.id;
	}

	exists(levelId) {
		return this.getChapterOf(levelId) != null;
	}

	getChapterOf(levelId) {
		const index = _.findIndex(this.chapters, (chapter) => {
			return _.some(chapter.levels, (level) => level.id === levelId);
		});
		const chapter = this.chapters[index];
		if (!chapter) return null;

		return chapter;
	}

	getChapterOfGlobalId(globalId) {
		const index = _.findIndex(this.chapters, (chapter) => {
			return _.some(chapter.levels, (level) => level.globalId === globalId);
		});
		const chapter = this.chapters[index];
		if (!chapter) return null;

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

	getLevelDefinitionOfGlobalId(globalId) {
		const chapter = this.getChapterOfGlobalId(globalId);
		const levelDefinition = chapter.levels.find(
			(level) => level.globalId === globalId
		);
		if (!levelDefinition) return null;

		return levelDefinition;
	}
}
