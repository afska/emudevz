import _ from "lodash";
import store from "../store";
import { bus } from "../utils";

const EMULATOR_ACTIVATION_LEVEL = "cartridge-a-broken-emulator";

export default class Book {
	constructor(metadata) {
		_.extend(this, metadata);
	}

	static get current() {
		return store.getState().book.instance;
	}

	unlock(unit) {
		store.dispatch.savedata.unlockUnit(unit);
		bus.emit("unit-unlocked");
	}

	getId(humanId) {
		for (let chapter of this.chapters) {
			for (let level of chapter.levels) {
				if (level.humanId === humanId) return level.globalId;
			}
		}

		return null;
	}

	canGoToPreviousChapter(chapter) {
		return chapter.id > 0;
	}

	canGoToNextChapter(chapter) {
		const nextLevelId = this.nextIdOf(_.last(chapter.levels).id, true);
		return this.isUnlocked(nextLevelId);
	}

	isUnlocked(levelId) {
		const maxChapterNumber = this._savedata.maxChapterNumber;
		const maxChapter = this.getChapterByNumber(maxChapterNumber);
		if (!maxChapter) return false;

		const level = this.getLevelDefinitionOf(levelId);
		if (!level) return false;

		const chapter = this.getChapterOf(levelId);

		if (chapter.isSpecial) {
			return this._savedata.unlockedLetsPlayLevels.includes(level.id);
		} else if (chapter.number < maxChapterNumber) {
			return true;
		} else if (chapter.number <= maxChapterNumber + 1) {
			const nextPendingLevel = this.nextPendingLevelOfChapter(maxChapter.id);
			if (!nextPendingLevel) return true;
			return level.globalId <= nextPendingLevel.globalId;
		} else {
			return false;
		}
	}

	nextPendingLevelOfChapter(chapterId) {
		const chapter = this.getChapter(chapterId);
		if (!chapter) return null;
		const pendingLevel = chapter.levels.find(
			(it) =>
				(!chapter.isSpecial || this.isUnlocked(it.id)) &&
				!this.isFinished(it.id)
		);
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
		return level.memory.content.multifile && snapshots.includes(level.id);
	}

	previousIdOf(levelId) {
		const level = this.getLevelDefinitionOf(levelId);
		if (!level) return null;
		let previousLevel = this.getLevelDefinitionOfGlobalId(level.globalId - 1);
		if (!previousLevel) return null;

		if (!this.isUnlocked(previousLevel.id)) {
			const chapter = this.getChapterOf(previousLevel.id);
			previousLevel = this.nextPendingLevelOfChapter(chapter.id);
			if (!previousLevel) return null;
		}

		return previousLevel.id;
	}

	nextIdOf(levelId, ignoreProgress = false) {
		const level = this.getLevelDefinitionOf(levelId);
		if (!level) return null;
		let nextLevel = this.getLevelDefinitionOfGlobalId(level.globalId + 1);
		if (!nextLevel) return null;

		if (ignoreProgress) return nextLevel.id;

		const maxChapterNumber = this._savedata.maxChapterNumber;
		const nextLevelChapter = this.getChapterOf(nextLevel.id);

		if (nextLevelChapter.number > maxChapterNumber) {
			const pendingLevels = _(this.chapters)
				.filter((it) => it.number === maxChapterNumber)
				.flatMap("levels")
				.filter((it) => !this.isFinished(it.id))
				.value();

			if (!_.isEmpty(pendingLevels)) {
				nextLevel = pendingLevels[0];
			}
		}

		return nextLevel.id;
	}

	exists(levelId) {
		return this.getChapterOf(levelId) != null;
	}

	getChapter(chapterId) {
		return _.find(this.chapters, { id: chapterId }) || null;
	}

	getChapterByNumber(chapterNumber) {
		return _.find(this.chapters, { number: chapterNumber }) || null;
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

	get canUseEmulator() {
		return this.isFinished(EMULATOR_ACTIVATION_LEVEL);
	}

	get _savedata() {
		return store.getState().savedata;
	}
}
