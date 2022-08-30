import React, { PureComponent } from "react";
import { MonoLayout } from "./components/layouts";
import { /*CodeEditor, */ Console /*, TV*/ } from "./components";
import ChatScript from "../chat/ChatScript";
import { connect } from "react-redux";
import locales from "../locales";
import styles from "./PlayScreen.module.css";

class PlayScreen extends PureComponent {
	componentDidMount() {
		const { level, levelData, setLevelData } = this.props;

		if (!levelData) {
			fetch(`levels/level${level}.json`)
				.then((req) => req.json())
				.then((levelData) => {
					window.scr = levelData.chat; // TODO: REMOVE

					// TODO: VALIDATE LEVEL
					const chatScript = new ChatScript(levelData.chat);
					chatScript.validate();
					setLevelData(levelData);
				});
		}
	}

	render() {
		const { levelData } = this.props;

		if (!levelData)
			return <div className={styles.loading}>{locales.get("loading")}</div>;

		return <MonoLayout Main={Console} onReady={this.onReady} />;
	}

	onReady = ({ main }) => {
		// TODO: USE main
	};
}

const mapStateToProps = ({ savedata, level }) => ({
	level: savedata.level,
	levelData: level.data,
});
const mapDispatchToProps = ({ level }) => ({ setLevelData: level.setData });

export default connect(mapStateToProps, mapDispatchToProps)(PlayScreen);
