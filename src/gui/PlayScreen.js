import React, { PureComponent } from "react";
import layouts from "./components/layouts";
import components from "./components";
import ChatScript from "../chat/ChatScript";
import { connect } from "react-redux";
import locales from "../locales";
import styles from "./PlayScreen.module.css";
import _ from "lodash";

// TODO: REFACTOR
class PlayScreen extends PureComponent {
	componentDidMount() {
		const { level, levelData, setLevelData } = this.props;

		if (!levelData) {
			fetch(`levels/level_${level}.json`)
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

		const Layout = layouts[levelData.ui.layout];
		const Components = _.mapValues(
			{
				[levelData.ui.console]: "console",
				...levelData.ui.components,
			},
			(v) => components[v]
		);

		return <Layout {...Components} onReady={this.onReady} />;
	}

	onReady = async (runningComponents) => {
		const { levelData } = this.props;

		const console = runningComponents[levelData.ui.console];
		await console.terminal.start(levelData.welcomeMessage.en);
	};
}

const mapStateToProps = ({ savedata, level }) => ({
	level: savedata.level,
	levelData: level.data,
});
const mapDispatchToProps = ({ level }) => ({ setLevelData: level.setData });

export default connect(mapStateToProps, mapDispatchToProps)(PlayScreen);
