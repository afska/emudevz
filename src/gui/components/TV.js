import React, { PureComponent } from "react";
import TVNoise from "./TVNoise";
import Emulator from "./emulator/Emulator";
import MarkdownView from "./widgets/MarkdownView";
import PanZoom from "./widgets/PanZoom";
import styles from "./TV.module.css";

export default class TV extends PureComponent {
	static get tabIcon() {
		return "📺 ";
	}

	state = { content: null, type: "media", error: false };

	async initialize(args, level) {
		if (args.content != null && args.type != null)
			this.setState({ content: args.content, type: args.type });

		this._level = level;
	}

	load(fileName) {
		const content = this._level?.media[fileName];
		if (!content) throw new Error(`Media not found: ${fileName}`);

		this.setState({ content, type: "media" });
	}

	render() {
		const { style, onKeyDown } = this.props;

		const isEmulator = this.state.type === "rom";
		const extraStyles = isEmulator
			? {
					aspectRatio: "256/240",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
			  }
			: {};

		return (
			<div
				id={isEmulator ? "emulator" : undefined}
				className={styles.tvContainer}
				tabIndex={0}
				ref={(ref) => {
					this.ref = ref;
				}}
				style={{ ...style, ...extraStyles }}
				onKeyDown={onKeyDown}
			>
				{this._renderContent()}
			</div>
		);
	}

	_renderContent() {
		const { content, type, error } = this.state;

		if (!content) return <TVNoise />;

		switch (type) {
			case "media": {
				return (
					<PanZoom
						src={content}
						options={{
							click: () => {
								setTimeout(() => {
									this.focus();
								});
							},
						}}
					/>
				);
			}
			case "markdown": {
				return <MarkdownView content={content} />;
			}
			case "rom": {
				if (error) return <TVNoise />;

				return (
					<Emulator
						rom={content}
						onError={(err) => {
							console.error(err);
							this.setState({ error: true });
						}}
					/>
				);
			}
			default: {
				return <TVNoise />;
			}
		}
	}

	focus = () => {
		this.ref.focus();
	};
}
