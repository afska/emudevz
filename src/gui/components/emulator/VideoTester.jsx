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
	_failed = false;
	_firstFailIndex = null;

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
						onFps={this._setFps}
						onFrame={this._onActualFrame}
						syncToVideo
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
						onFps={this._setFps}
						onFrame={this._onExpectedFrame}
						syncToVideo
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

		if (
			this._framesA.length > this._count &&
			this._framesB.length > this._count
		) {
			const frameA = this._framesA[this._count];
			const frameB = this._framesB[this._count];

			let same = true;
			for (let i = 0; i < 256 * 240; i++) {
				if (frameA[i] !== frameB[i]) {
					same = false;
					break;
				}
			}

			if (!same) {
				if (!this._failed) {
					this._failed = true;
					this._firstFailIndex = this._count;
					this._symbol.innerHTML = "❌";
					this._progressBar.setBarFillColor("#d9534f");
					this._closeButton.style.display = "block";
				}
			}

			this._count++;

			const percentage = Math.min(100, (this._count / this._testFrames) * 100);
			this._progressBar.setPercentage(percentage);
			this._detail.innerHTML = this._count + " / " + this._testFrames;

			if (this._count >= this._testFrames) {
				if (this._failed) this._checkDiffsButton.style.display = "block";

				this.props.onEnd({
					success: !this._failed,
					frame: this._failed ? this._firstFailIndex : this._count - 1,
					total: this._testFrames,
				});
			}
		}
	};

	_checkDiffs = () => {
		const idx = this._firstFailIndex ?? Math.max(0, this._count - 1);

		const sequence = {
			total: this._testFrames,
			initialIndex: idx + 1, // (1-based)
			actualFrames: this._framesA,
			expectedFrames: this._framesB,
		};

		bus.emit("image-diff", sequence);
	};

	_setError = (e) => {
		console.error(e);

		const reason = e?.message || e?.toString() || "?";
		const fullStack = testContext.javascript.buildStack(e);
		this.props.onError({ reason, fullStack });
	};

	_setFps = () => {};

	get _settings() {
		return {
			useCartridge: false,
			useCPU: false,
			usePPU: false,
			useAPU: false,
			useController: false,
			useConsole: false,
			unbroken: true,
		};
	}

	get _testFrames() {
		return this.props.test.frames;
	}
}
