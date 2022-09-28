import React, { PureComponent } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import Book from "../level/Book";
import LevelLoader from "../level/LevelLoader";
import locales from "../locales";
import { bus } from "../utils";
import LevelScreen from "./LevelScreen";
import styles from "./PlayScreen.module.css";

const LEVELS_PATH = "levels";
const BOOK_PATH = `${LEVELS_PATH}/book.json`;
const LEVEL_ID_LENGTH = 3;
const STATUS_OK = 200;

class PlayScreen extends PureComponent {
	state = { path: null, error: null };

	componentDidMount() {
		const { currentLevelId, validateSavedata } = this.props;
		validateSavedata(currentLevelId);

		this._loadBook();
	}

	componentDidUpdate() {
		const { path, currentLevelId, resetLevel, validateSavedata } = this.props;
		if (!validateSavedata(currentLevelId)) return;
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
		const { maxLevelId, book, level } = this.props;

		if (error) return <div className={styles.message}>❌ {error}</div>;

		if (!book || !level || !this.currentChapter)
			return <div className={styles.message}>⌛ {locales.get("loading")}</div>;

		return (
			<div className={styles.container}>
				<LevelScreen
					maxLevelId={maxLevelId}
					chapter={this.currentChapter}
					level={level}
				/>
			</div>
		);
	}

	get formattedLevelId() {
		return this.props.currentLevelId.toString().padStart(LEVEL_ID_LENGTH, 0);
	}

	get currentChapter() {
		const { book, currentLevelId } = this.props;
		return book?.getChapterOf(currentLevelId);
	}

	_onError = (e) => {
		this.setState({ error: e.message });
		console.error(e);
	};

	_loadBook() {
		const { setBook } = this.props;

		fetch(BOOK_PATH)
			.then((req) => {
				if (req.status !== STATUS_OK) throw new Error("Book not found.");
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

	_loadLevel() {
		const { currentLevelId, setLevel } = this.props;

		const levelPath = `${LEVELS_PATH}/level_${this.formattedLevelId}.zip`;

		fetch(levelPath)
			.then((req) => {
				if (req.status !== STATUS_OK) throw new Error("Level not found.");
				return req.arrayBuffer();
			})
			.then((levelData) => new LevelLoader(levelData, currentLevelId).load())
			.then(setLevel)
			.catch(this._onError);
	}
}

const mapStateToProps = ({ router, savedata, book, level }) => {
	const path = router.location.pathname;
	let currentLevelId = parseInt(_.last(path.split("/")));
	if (!isFinite(currentLevelId)) currentLevelId = 0;

	return {
		path: path + router.location.search,
		currentLevelId,
		maxLevelId: savedata.levelId,
		book: book.instance,
		level: level.instance,
	};
};
const mapDispatchToProps = ({ book, savedata, level }) => ({
	setBook: book.setBook,
	setLevel: level.setLevel,
	resetLevel: level.reset,
	validateSavedata: savedata.validate,
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayScreen);
