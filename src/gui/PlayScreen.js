import React, { PureComponent } from "react";
import Book from "../level/Book";
import LevelLoader from "../level/LevelLoader";
import LevelScreen from "./LevelScreen";
import { connect } from "react-redux";
import locales from "../locales";
import styles from "./PlayScreen.module.css";
import _ from "lodash";

const LEVELS_PATH = "/levels";
const BOOK_PATH = `${LEVELS_PATH}/book.json`;
const LEVEL_ID_LENGTH = 3;
const STATUS_OK = 200;

class PlayScreen extends PureComponent {
	state = { currentLevelId: null, error: null };

	componentDidMount() {
		const { currentLevelId, validateSavedata } = this.props;
		if (!validateSavedata(currentLevelId)) return;

		this._loadBook();
		this._loadLevel();
	}

	componentDidUpdate() {
		const { currentLevelId, resetLevel, validateSavedata } = this.props;
		if (!validateSavedata(currentLevelId)) return;

		if (currentLevelId !== this.state.currentLevelId) {
			this.setState({ currentLevelId, error: null });
			resetLevel();
			this._loadLevel();
		}
	}

	render() {
		const { error } = this.state;
		const { book, level } = this.props;

		if (error) return <div className={styles.message}>❌ {error}</div>;

		if (!book || !level || !this.currentChapter)
			return <div className={styles.message}>⌛ {locales.get("loading")}</div>;

		return (
			<div className={styles.container}>
				<LevelScreen chapter={this.currentChapter} level={level} />
			</div>
		);
	}

	get formattedLevelId() {
		return this.props.currentLevelId.toString().padStart(LEVEL_ID_LENGTH, 0);
	}

	get currentChapter() {
		const { book, currentLevelId } = this.props;
		return book.getChapterOf(currentLevelId);
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
		const { setLevel } = this.props;

		const levelPath = `${LEVELS_PATH}/level_${this.formattedLevelId}.zip`;

		fetch(levelPath)
			.then((req) => {
				if (req.status !== STATUS_OK) throw new Error("Level not found.");
				return req.arrayBuffer();
			})
			.then((levelData) => new LevelLoader(levelData).load())
			.then(setLevel)
			.catch(this._onError);
	}
}

const mapStateToProps = ({ router, savedata, book, level }) => {
	let currentLevelId = parseInt(_.last(router.location.pathname.split("/")));
	if (!isFinite(currentLevelId)) currentLevelId = 0;

	return {
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
