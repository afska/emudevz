import React, { PureComponent } from "react";
import TVNoise from "./TVNoise";
import PanZoom from "./widgets/PanZoom";
import styles from "./TV.module.css";

export default class TV extends PureComponent {
	state = { image: null };

	async initialize(args, level) {
		this._level = level;
	}

	load(fileName) {
		const image = this._level?.media[fileName];
		if (!image) throw new Error(`Image not found: ${fileName}`);

		this.setState({ image });
	}

	render() {
		return (
			<div
				className={styles.tvContainer}
				tabIndex={0}
				ref={(ref) => {
					this.ref = ref;
				}}
			>
				{this._renderContent()}
			</div>
		);
	}

	_renderContent() {
		const { image } = this.state;

		if (!image) return <TVNoise />;

		return (
			<PanZoom
				src={image}
				options={{
					click: false,
				}}
			/>
		);
	}

	focus = () => {
		this.ref.focus();
	};
}
