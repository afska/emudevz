import _ from "lodash";
import store from "../store";

// TODO: When calling nextIdOf, ensure that all chapters with the same number are finished

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
				if (level.humanId === humanId) return level.globalId;
			}
		}

		return null;
	}

	isUnlockedNext(levelId) {
		const nextLevelId = this.nextIdOf(levelId);
		return this.isUnlocked(nextLevelId);
	}

	isUnlocked(levelId) {
		const maxChapterNumber = this._savedata.maxChapterNumber;
		const level = this.getLevelDefinitionOf(levelId);
		if (!level) return false;
		const chapter = this.getChapterOf(levelId);

		if (chapter.number < maxChapterNumber) {
			return true;
		} else if (chapter.number > maxChapterNumber) {
			return false;
		} else {
			const nextPendingLevel = this.nextPendingLevelOfChapter(chapter.id);
			if (!nextPendingLevel) return false; // (should not happen)
			return level.globalId <= nextPendingLevel.globalId;
		}
	}

	nextPendingLevelOfChapter(chapterId) {
		const chapter = this.getChapter(chapterId);
		if (!chapter) return null;
		const pendingLevel = chapter.levels.find((it) => !this.isFinished(it.id));
		return pendingLevel || null;
	}

	isFinished(levelId) {
		const completedLevels = this._savedata.completedLevels;
		return completedLevels.includes(levelId);
	}

	canReset(level) {
		return !level.memory.content.multifile;
	}

	canRollback(level) {
		const snapshots = this._savedata.snapshots;
		return level.memory.content.multifile && !_.isEmpty(snapshots);
	}

	previousIdOf(levelId) {
		const level = this.getLevelDefinitionOf(levelId);
		if (!level) return null;
		const previousLevel = this.getLevelDefinitionOfGlobalId(level.globalId - 1);
		if (!previousLevel) return null;

		return previousLevel.id;
	}

	nextIdOf(levelId) {
		const level = this.getLevelDefinitionOf(levelId);
		if (!level) return null;
		const nextLevel = this.getLevelDefinitionOfGlobalId(level.globalId + 1);
		if (!nextLevel) return null;

		return nextLevel.id;
	}

	exists(levelId) {
		return this.getChapterOf(levelId) != null;
	}

	getChapter(chapterId) {
		return _.find(this.chapters, { id: chapterId }) || null;
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
		if (!chapter) return null;
		const levelDefinition = chapter.levels.find(
			(level) => level.id === levelId
		);
		if (!levelDefinition) return null;

		return levelDefinition;
	}

	getLevelDefinitionOfGlobalId(globalId) {
		const chapter = this.getChapterOfGlobalId(globalId);
		if (!chapter) return null;
		const levelDefinition = chapter.levels.find(
			(level) => level.globalId === globalId
		);
		if (!levelDefinition) return null;

		return levelDefinition;
	}

	get _savedata() {
		return store.getState().savedata;
	}
}
