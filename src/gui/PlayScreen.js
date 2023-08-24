import React, { PureComponent } from "react";
import { Toaster } from "react-hot-toast";
import { connect } from "react-redux";
import _ from "lodash";
import filesystem from "../filesystem";
import Book from "../level/Book";
import LevelLoader from "../level/LevelLoader";
import locales from "../locales";
import { bus } from "../utils";
import LevelScreen from "./LevelScreen";
import styles from "./PlayScreen.module.css";

const LEVELS_PATH = "levels";
export const BOOK_PATH = `${LEVELS_PATH}/book.json`;
const STATUS_OK = 200;

class PlayScreen extends PureComponent {
	state = { path: null, error: null };

	componentDidMount() {
		this._loadBook();
	}

	componentDidUpdate() {
		const {
			book,
			path,
			currentLevelId,
			resetLevel,
			validateSavedata,
		} = this.props;

		if (book && !validateSavedata(currentLevelId)) return;
		if (!this.currentChapter) return;

		if (path !== this.state.path) {
			bus.removeAllListeners();
			this.setState({ path, error: null });
			resetLevel();

			this._loadLevel();
		}
	}

	render() {
		const { error } = this.state;
		const { book, level } = this.props;

		if (error) return <div className={styles.message}>❌ {error}</div>;

		const chapter = this.currentChapter;
		if (!book || !level || !chapter)
			return <div className={styles.message}>⌛ {locales.get("loading")}</div>;

		return (
			<div className={styles.container}>
				{!chapter.isSpecial && <Toaster containerClassName="toaster-wrapper" />}
				<LevelScreen chapter={chapter} level={level} />
			</div>
		);
	}

	get currentChapter() {
		const { book, currentLevelId } = this.props;
		return book?.getChapterOf(currentLevelId);
	}

	_onError = (e) => {
		this.setState({ error: e?.message || e?.toString() || "?" });
		console.error(e);
	};

	_loadBook() {
		const { setBook } = this.props;

		fetch(BOOK_PATH)
			.then((req) => {
				if (req.status !== STATUS_OK) throw new Error("Book not found");
				return req.json();
			})
			.then((book) => new Book(book))
			.then(setBook)
			.then(() => {
				if (!this.currentChapter)
					throw new Error(`Unexisting level: ${this.props.currentLevelId}`);
			})
			.catch(this._onError);
	}

	async _loadLevel() {
		const { currentLevelId, setLevel } = this.props;

		const levelPath = `${LEVELS_PATH}/level_${currentLevelId}.zip`;

		await filesystem.load;
		await fetch(levelPath)
			.then((req) => {
				if (req.status !== STATUS_OK) throw new Error("Level not found.");
				return req.arrayBuffer();
			})
			.then((levelData) => new LevelLoader(levelData, currentLevelId).load())
			.then(setLevel)
			.catch(this._onError);
	}
}

const mapStateToProps = ({ router, book, level }) => {
	const path = router.location.pathname;
	const currentLevelId = _.last(path.split("/"));

	return {
		path: path + router.location.search,
		currentLevelId,
		book: book.instance,
		level: level.instance,
	};
};
const mapDispatchToProps = ({ book, level, savedata }) => ({
	setBook: book.setBook,
	setLevel: level.setLevel,
	resetLevel: level.reset,
	validateSavedata: savedata.validate,
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayScreen);
