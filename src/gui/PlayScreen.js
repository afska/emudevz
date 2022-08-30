import React, { PureComponent } from "react";
import layouts from "./components/layouts";
import components from "./components";
import Level from "../level/Level";
import { connect } from "react-redux";
import locales from "../locales";
import styles from "./PlayScreen.module.css";
import _ from "lodash";

class PlayScreen extends PureComponent {
	state = { error: null };

	componentDidMount() {
		const { levelId, level, setLevel } = this.props;

		if (!level) {
			fetch(`levels/level_${levelId}.json`)
				.then((req) => req.json())
				.then((levelData) => {
					window.scr = levelData.chat; // TODO: REMOVE

					try {
						const level = new Level(levelData);
						level.validate();
						setLevel(level);
					} catch (e) {
						this.setState({ error: e.message });
					}
				});
		}
	}

	render() {
		const { error } = this.state;
		const { level } = this.props;

		if (error) return <div className={styles.message}>❌ {error}</div>;

		if (!level)
			return <div className={styles.message}>⌛ {locales.get("loading")}</div>;

		const Layout = layouts[level.ui.layout];
		const Components = _.mapValues(
			level.ui.components,
			([name]) => components[name]
		);

		return <Layout {...Components} onReady={this.onReady} />;
	}

	onReady = async (runningComponents) => {
		const { level } = this.props;

		_.forEach(runningComponents, async (runningComponent, name) => {
			const args = level.ui.components[name][1];
			await runningComponent.initialize(args);
		});
	};
}

const mapStateToProps = ({ savedata, level }) => ({
	levelId: savedata.levelId,
	level: level.instance,
});
const mapDispatchToProps = ({ level }) => ({ setLevel: level.setLevel });

export default connect(mapStateToProps, mapDispatchToProps)(PlayScreen);
