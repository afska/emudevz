import React, { PureComponent } from "react";
import filesystem from "../../filesystem";
import TVNoise from "./TVNoise";
import AudioTester from "./emulator/AudioTester";
import DemoEmulatorRunner from "./emulator/DemoEmulatorRunner";
import EmulatorRunner from "./emulator/EmulatorRunner";
import GameStreamer from "./emulator/GameStreamer";
import VideoTester from "./emulator/VideoTester";
import MarkdownView from "./widgets/MarkdownView";
import PanZoom from "./widgets/PanZoom";
import styles from "./TV.module.css";

export default class TV extends PureComponent {
	static get id() {
		return "TV";
	}

	static get tabIcon() {
		return "📺 ";
	}

	state = { content: null, type: "media", _error: null, _saveState: null };

	async initialize(args, level) {
		this._level = level;

		if (args.type != null)
			this.setState({ content: args.content, type: args.type, _error: null });
	}

	load(fileName, type = "media", bucket = "media") {
		const content = (fileName && this._level?.[bucket]?.[fileName]) || null;
		this.setContent(content, type);
	}

	loadROM(filePath, type = "rom") {
		const file = filesystem.read(filePath, { binary: true });
		this.setContent(file, type);
	}

	setContent(content, type) {
		this.setState({ content, type, _error: null, _saveState: null });
	}

	render() {
		const { style, onKeyDown } = this.props;

		const id =
			this.state.type === "rom" || this.state.type === "stream"
				? "emulator"
				: undefined;

		return (
			<div
				id={id}
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

	componentDidMount() {
		window.addEventListener("dragover", this._ignore);
		window.addEventListener("dragenter", this._ignore);
		window.addEventListener("drop", this._onFileDrop);
	}

	componentWillUnmount() {
		window.removeEventListener("dragover", this._ignore);
		window.removeEventListener("dragenter", this._ignore);
		window.removeEventListener("drop", this._onFileDrop);
	}

	_resetContent(content, saveState = null) {
		this.setState({ content: null, _error: null, _saveState: null }, () => {
			if (content != null) this.setState({ content, _saveState: saveState });
		});
	}

	_renderContent() {
		const { content, type, _error, _saveState } = this.state;

		switch (type) {
			case "media": {
				if (!content) return <TVNoise />;

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
				if (!content) return <TVNoise />;

				return <MarkdownView content={content} />;
			}
			case "rom": {
				return (
					<EmulatorRunner
						rom={content}
						error={_error}
						saveState={_saveState}
						onError={(e) => {
							this.setState({ _error: e });
						}}
						onLoadROM={(fileContent) => {
							this._resetContent(fileContent);
						}}
						onRestart={(saveState) => {
							this._resetContent(content, saveState);
						}}
						onStop={() => {
							this._resetContent(null);
						}}
					/>
				);
			}
			case "demoRom": {
				return (
					<DemoEmulatorRunner
						id={this._level.id}
						rom={content}
						saveState={_saveState}
						ref={(ref) => {
							this.stream = ref;
						}}
					/>
				);
			}
			case "stream": {
				return (
					<GameStreamer
						id={this._level.id}
						rom={content}
						ref={(ref) => {
							this.stream = ref;
						}}
					/>
				);
			}
			case "audioTest": {
				return (
					<AudioTester
						APU={content.APU}
						rom={content.rom}
						saveState={content.saveState}
						test={content.test}
						onEnd={content.onEnd}
						onFrame={content.onFrame}
						onError={(e) => {
							content.onError(e);
						}}
						onClose={() => this.setContent(null, "rom")}
					/>
				);
			}
			case "videoTest": {
				return (
					<VideoTester
						PPU={content.PPU}
						rom={content.rom}
						saveState={content.saveState}
						test={content.test}
						onEnd={content.onEnd}
						onFrame={content.onFrame}
						onError={(e) => {
							content.onError(e);
						}}
						onClose={() => this.setContent(null, "rom")}
					/>
				);
			}
			default: {
				return <TVNoise />;
			}
		}
	}

	_onFileDrop = (e) => {
		if (this.state.type !== "rom") return;
		e.preventDefault();

		const file = e.dataTransfer.files[0];
		const reader = new FileReader();
		if (!file) return;

		reader.onload = (event) => {
			const rom = event.target.result;
			this.setContent(rom, "rom");
		};

		reader.readAsArrayBuffer(file);
	};

	_ignore = (e) => {
		e.stopPropagation();
		e.preventDefault();
	};

	focus = () => {
		this.ref.focus();
	};
}
