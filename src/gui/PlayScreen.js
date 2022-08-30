import React, { PureComponent } from "react";
import layouts from "./components/layouts";
import components from "./components";
import Level from "../level/Level";
import { connect } from "react-redux";
import locales from "../locales";
import styles from "./PlayScreen.module.css";
import _ from "lodash";

// TODO: REFACTOR
class PlayScreen extends PureComponent {
	componentDidMount() {
		const { levelId, level, setLevel } = this.props;

		if (!level) {
			fetch(`levels/level_${levelId}.json`)
				.then((req) => req.json())
				.then((levelData) => {
					window.scr = levelData.chat; // TODO: REMOVE

					const level = new Level(levelData);
					level.validate();
					setLevel(level);
				});
		}
	}

	render() {
		const { level } = this.props;

		if (!level)
			return <div className={styles.loading}>{locales.get("loading")}</div>;

		const Layout = layouts[level.ui.layout];
		const Components = _.mapValues(
			{
				[level.ui.console]: "console",
				...level.ui.components,
			},
			(v) => components[v]
		);

		return <Layout {...Components} onReady={this.onReady} />;
	}

	onReady = async (runningComponents) => {
		const { level } = this.props;

		const console = runningComponents[level.ui.console];
		await console.terminal.start(
			level.welcomeMessage?.en, // TODO: LOCALIZE
			level.availableCommands
		);
	};
}

const mapStateToProps = ({ savedata, level }) => ({
	levelId: savedata.levelId,
	level: level.level,
});
const mapDispatchToProps = ({ level }) => ({ setLevel: level.setLevel });

export default connect(mapStateToProps, mapDispatchToProps)(PlayScreen);
