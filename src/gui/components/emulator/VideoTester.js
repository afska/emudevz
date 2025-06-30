import React, { PureComponent } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import locales from "../../../locales";
import testContext from "../../../terminal/commands/test/context";
import { bus } from "../../../utils";
import IconButton from "../widgets/IconButton";
import ProgressBar from "../widgets/ProgressBar";
import Emulator from "./Emulator";
import styles from "./VideoTester.module.css";

export default class VideoTester extends PureComponent {
	_framesA = [];
	_framesB = [];
	_count = 0;

	render() {
		const { PPU, rom, saveState, onClose } = this.props;

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
						saveState={saveState}
						settings={{
							...this._settings,
							usePPU: true,
							withLatestCode: false,
						}}
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
					<div
						ref={(ref) => {
							this._symbol = ref;
						}}
					>
						🧐
					</div>
					<ProgressBar
						percentage={0}
						animated={false}
						ref={(ref) => {
							this._progressBar = ref;
						}}
					/>
					<code
						ref={(ref) => {
							this._detail = ref;
						}}
						className={styles.frameDetails}
					></code>
					<IconButton
						Icon={FaSearch}
						tooltip={locales.get("check_diffs")}
						onClick={this._checkDiffs}
						kind="inline-no-margin"
						className={styles.checkDiffs}
						style={{ display: "none" }}
						$ref={(ref) => {
							this._checkDiffsButton = ref;
						}}
					/>
				</div>
				<div className={styles.column} style={{ flex: 3 }}>
					<h6 className={styles.title}>
						{locales.get("tests_video_expected_output")}
					</h6>
					<Emulator
						rom={rom}
						saveState={saveState}
						settings={{
							...this._settings,
							customPPU: PPU,
							withLatestCode: false,
						}}
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
				this._screenshotA = this._emulatorA.getScreenshot();
				this._screenshotB = this._emulatorB.getScreenshot();
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

				this._checkDiffsButton.style.display = "block";
				return;
			}

			this._count++;

			if (this._count < this._testFrames) {
				const percentage = (this._count / this._testFrames) * 100;
				this._progressBar.setPercentage(percentage);
				this._detail.innerHTML = this._count + " / " + this._testFrames;
			} else {
				this._progressBar.setPercentage(100);
				this.props.onEnd({ success: true });
				this._detail.innerHTML = this._count + " / " + this._testFrames;
			}
		}
	};

	_checkDiffs = () => {
		bus.emit("image-diff", this._screenshotB, this._screenshotA);
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
