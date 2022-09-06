import React, { PureComponent } from "react";
import layouts from "./components/layouts";
import components from "./components";
import NavBar from "./components/widgets/NavBar";
import _ from "lodash";

class LevelScreen extends PureComponent {
	render() {
		const { chapter, level } = this.props;

		const Layout = layouts[level.ui.layout];
		const Components = _.mapValues(
			level.ui.components,
			([name]) => components[name]
		);

		return (
			<>
				<Layout
					{...Components}
					onReady={this.onReady}
					ref={(ref) => {
						this.layout = ref;
					}}
				/>
				<NavBar chapter={chapter} />
			</>
		);
	}

	onReady = async (runningComponents) => {
		const { level } = this.props;

		_.forEach(runningComponents, async (runningComponent, name) => {
			const [, args] = level.ui.components[name];
			await runningComponent.initialize(args, level);
		});

		this.layout.focus(level.ui.focus);
	};
}

export default LevelScreen;
