import React, { PureComponent } from "react";
import layouts from "./components/layouts";
import components from "./components";
import NavBar from "./components/widgets/NavBar";
import LevelLoader from "../level/LevelLoader";
import { connect } from "react-redux";
import locales from "../locales";
import styles from "./PlayScreen.module.css";
import _ from "lodash";

const BOOK_PATH = "levels/book.json";
const LEVEL_ID_LENGTH = 3;
const STATUS_OK = 200;

class PlayScreen extends PureComponent {
	state = { error: null };

	componentDidMount() {
		const { book, level } = this.props;

		if (!book) this._loadBook();
		if (!level) this._loadLevel();
	}

	render() {
		const { error } = this.state;
		const { book, level } = this.props;

		if (error) return <div className={styles.message}>❌ {error}</div>;

		if (!book || !level)
			return <div className={styles.message}>⌛ {locales.get("loading")}</div>;

		const Layout = layouts[level.ui.layout];
		const Components = _.mapValues(
			level.ui.components,
			([name]) => components[name]
		);

		return (
			<div className={styles.container}>
				<Layout
					{...Components}
					onReady={this.onReady}
					ref={(ref) => {
						this.layout = ref;
					}}
				/>
				<NavBar />
			</div>
		);
	}

	onReady = async (runningComponents) => {
		const { level } = this.props;

		_.forEach(runningComponents, async (runningComponent, name) => {
			const [, args] = level.ui.components[name];
			await runningComponent.initialize(args);
		});

		this.layout.focus(level.ui.focus);
	};

	get formattedLevelId() {
		return this.props.levelId.toString().padStart(LEVEL_ID_LENGTH, 0);
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
			.then(setBook)
			.catch(this._onError);
	}

	_loadLevel() {
		const { setLevel } = this.props;

		const levelPath = `levels/level_${this.formattedLevelId}.zip`;

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

const mapStateToProps = ({ savedata, level }) => ({
	levelId: savedata.levelId,
	book: level.book,
	level: level.instance,
});
const mapDispatchToProps = ({ level }) => ({
	setBook: level.setBook,
	setLevel: level.setLevel,
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayScreen);
