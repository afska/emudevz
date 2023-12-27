import React, { PureComponent } from "react";
import { FaTimes } from "react-icons/fa";
import locales from "../../../locales";
import testContext from "../../../terminal/commands/test/context";
import IconButton from "../widgets/IconButton";
import ProgressBar from "../widgets/ProgressBar";
import Emulator from "./Emulator";
import styles from "./VideoTester.module.css";

export default class VideoTester extends PureComponent {
	_framesA = [];
	_framesB = [];
	_count = 0;

	render() {
		const { PPU, rom, onClose } = this.props;

		return (
			<div className={styles.row}>
				<IconButton
					Icon={FaTimes}
					tooltip={locales.get("close")}
					onClick={onClose}
					className={styles.closeButton}
					style={{ display: "none" }}
					$ref={(ref) => {
						this._closeButton = ref;
					}}
				/>

				<div className={styles.column} style={{ flex: 3 }}>
					<h6 className={styles.title}>
						{locales.get("tests_video_ppu_output")}
					</h6>
					<Emulator
						rom={rom}
						settings={{ ...this._settings, usePPU: true }}
						volume={0}
						onError={this._setError}
						onInputType={this._setInputType}
						onFps={this._setFps}
						onFrame={this._onActualFrame}
						style={{ width: "auto", height: "auto" }}
						ref={(ref) => {
							this._emulatorA = ref;
						}}
					/>
				</div>
				<div className={styles.column}>
					<span
						ref={(ref) => {
							this._symbol = ref;
						}}
					>
						🧐
					</span>
					<ProgressBar
						percentage={0}
						animated={false}
						ref={(ref) => {
							this._progressBar = ref;
						}}
					/>
				</div>
				<div className={styles.column} style={{ flex: 3 }}>
					<h6 className={styles.title}>
						{locales.get("tests_video_expected_output")}
					</h6>
					<Emulator
						rom={rom}
						settings={{ ...this._settings, customPPU: PPU }}
						volume={0}
						onError={(e) => {
							console.error(e);
						}}
						onInputType={this._setInputType}
						onFps={this._setFps}
						onFrame={this._onExpectedFrame}
						style={{ width: "auto", height: "auto" }}
						ref={(ref) => {
							this._emulatorB = ref;
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
		this.props.onFrame();

		if (this._framesB.length < this._testFrames)
			this._framesB.push(frameBuffer.slice());

		if (this._framesA.length > 0 && this._framesB.length > 0) {
			const frameA = this._framesA.shift();
			const frameB = this._framesB.shift();

			let success = true;
			for (let i = 0; i < 256 * 240; i++)
				if (frameA[i] !== frameB[i]) success = false;

			if (!success) {
				this._emulatorA.setBuffer(frameA);
				this._emulatorB.setBuffer(frameB);
				this._emulatorA.stop();
				this._emulatorB.stop();
				this._symbol.innerHTML = "❌";
				this.props.onEnd({
					success,
					frame: this._count,
					total: this._testFrames,
				});
				this._progressBar.setBarFillColor("#d9534f");
				this._closeButton.style.display = "block";
				return;
			}

			this._count++;

			if (this._count < this._testFrames) {
				const percentage = (this._count / this._testFrames) * 100;
				this._progressBar.setPercentage(percentage);
			} else {
				this._progressBar.setPercentage(100);
				this.props.onEnd({ success: true });
			}
		}
	};

	_setError = (e) => {
		console.error(e);

		const reason = e?.message || e?.toString() || "?";
		const fullStack = testContext.javascript.buildStack(e);
		this.props.onError({ reason, fullStack });
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
