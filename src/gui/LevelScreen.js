import React, { PureComponent } from "react";
import layouts from "./components/layouts";
import components from "./components";
import NavBar from "./components/widgets/NavBar";
import _ from "lodash";

class LevelScreen extends PureComponent {
	render() {
		const { maxLevelId, chapter, level } = this.props;

		const Layout = layouts[level.ui.layout];
		const Components = _.mapValues(
			level.ui.components,
			([name]) => components[name]
		);

		return (
			<>
				<Layout {...Components} ref={this.onReady} />
				<NavBar maxLevelId={maxLevelId} chapter={chapter} level={level} />
			</>
		);
	}

	onReady = async (layout) => {
		if (!layout) return;
		this.layout = layout;

		setTimeout(() => {
			const runningComponents = layout.instances;
			const { level } = this.props;

			_.forEach(runningComponents, async (runningComponent, name) => {
				const [, args] = level.ui.components[name];
				await runningComponent.initialize(args, level);
			});

			layout.focus(level.ui.focus);
		});
	};
}

export default LevelScreen;
