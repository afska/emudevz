import React, { PureComponent } from "react";
import TVNoise from "./TVNoise";
import MarkdownView from "./widgets/MarkdownView";
import PanZoom from "./widgets/PanZoom";
import styles from "./TV.module.css";

export default class TV extends PureComponent {
	static get tabIcon() {
		return "📺 ";
	}

	state = { content: null, type: "media" };

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

		return (
			<div
				className={styles.tvContainer}
				tabIndex={0}
				ref={(ref) => {
					this.ref = ref;
				}}
				style={style}
				onKeyDown={onKeyDown}
			>
				{this._renderContent()}
			</div>
		);
	}

	_renderContent() {
		const { content, type } = this.state;

		if (!content) return <TVNoise />;

		switch (type) {
			case "media": {
				return (
					<PanZoom
						src={content}
						options={{
							click: false,
						}}
					/>
				);
			}
			case "markdown": {
				return <MarkdownView content={content} />;
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
