import React, { PureComponent } from "react";
import _ from "lodash";
import locales from "../../../locales";
import store from "../../../store";
import testContext from "../../../terminal/commands/test/context";
import { bus } from "../../../utils";
import Emulator from "./Emulator";
import styles from "./VideoTester.module.css";

export default class VideoTester extends PureComponent {
	_framesA = [];
	_framesB = [];
	_count = 0;
	state = { hasEnded: false };

	render() {
		const { PPU, rom, error } = this.props;
		const { hasEnded } = this.state;

		if (hasEnded) return false;

		return (
			<div
				className={styles.row}
				ref={(ref) => {
					this._container = ref;
				}}
			>
				<div className={styles.column}>
					<h6 className={styles.title}>
						{locales.get("tests_video_ppu_output")}
					</h6>
					<Emulator
						rom={rom}
						error={error}
						settings={{ ...this._settings, usePPU: true }}
						volume={0}
						onError={this._setError}
						onInputType={this._setInputType}
						onFps={this._setFps}
						onFrame={this._onActualFrame}
						ref={(ref) => {
							this._emulator = ref;
						}}
					/>
				</div>
				<div className={styles.column}>
					<h6 className={styles.title}>
						{locales.get("tests_video_expected_output")}
					</h6>
					<Emulator
						rom={rom}
						error={error}
						settings={{ ...this._settings, customPPU: PPU }}
						volume={0}
						onError={this._setError}
						onInputType={this._setInputType}
						onFps={this._setFps}
						onFrame={this._onExpectedFrame}
						ref={(ref) => {
							this._emulator = ref;
						}}
					/>
				</div>
			</div>
		);
	}

	_onActualFrame = (frameBuffer) => {
		if (this._framesA.length < this._testFrames)
			this._framesA.push(frameBuffer.slice());
	};

	_onExpectedFrame = (frameBuffer) => {
		if (this._framesB.length < this._testFrames)
			this._framesB.push(frameBuffer.slice());

		if (this._framesA.length > 0 && this._framesB.length > 0) {
			const frameA = this._framesA.shift();
			const frameB = this._framesB.shift();

			// TODO: COMPARE FRAMES
			const success = true;

			this._count++;
			if (this._count >= this._testFrames) {
				this.setState({ hasEnded: true });
				this.props.onEnd(success);
			}
		}
	};

	_setError = (e) => {
		console.error(e);

		const stack = testContext.javascript.buildStack(e);
		if (stack?.location) {
			const { filePath, lineNumber } = stack.location;

			store.dispatch.savedata.openFile(filePath);
			if (_.isFinite(lineNumber))
				bus.emit("highlight", { line: lineNumber - 1 });
		}

		const error = testContext.javascript.buildHTMLError(e);
		this.props.onError(error);
	};

	_setInputType = () => {};

	_setFps = () => {};

	get _settings() {
		return {
			useCartridge: false,
			useCPU: false,
			usePPU: false,
			useAPU: false,
			useController: false,
			useConsole: false,
			useMappers: false,
			unbroken: true,
		};
	}

	get _testFrames() {
		return this.props.test.frames;
	}
}
