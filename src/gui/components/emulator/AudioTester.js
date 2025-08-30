import React, { PureComponent } from "react";
import { FaTimes } from "react-icons/fa";
import Level from "../../../level/Level";
import locales from "../../../locales";
import testContext from "../../../terminal/commands/test/context";
import AudioComparer from "../debugger/AudioComparer";
import IconButton from "../widgets/IconButton";
import Emulator from "./Emulator";
import styles from "./AudioTester.module.css";

const SAMPLE_EPSILON = 1e-4;

export default class AudioTester extends PureComponent {
	_mixA = [];
	_mixB = [];
	_framesA = 0;
	_framesB = 0;
	_count = 0;
	_firstFailIndex = 0;

	render() {
		const { APU, rom, saveState, onClose } = this.props;

		return (
			<AudioComparer
				ref={(ref) => {
					this._comparer = ref;
					if (ref) ref.initialize({}, Level.current);
				}}
				accessory={
					<>
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

						<Emulator
							screen={{
								setBuffer: (buffer) => {},
							}}
							rom={rom}
							saveState={saveState}
							settings={{
								...this._settings,
								useAPU: true,
								withLatestCode: false,
							}}
							volume={this._volume}
							onError={this._setError}
							onInputType={this._setInputType}
							onFps={this._setFps}
							onStart={this._onActualEmulatorStart}
							onFrame={this._onActualFrame}
							style={{ width: "auto", height: "auto" }}
							ref={(ref) => {
								this._emulatorA = ref;
							}}
						/>

						<Emulator
							screen={{
								setBuffer: (buffer) => {},
							}}
							rom={rom}
							saveState={saveState}
							settings={{
								...this._settings,
								customAPU: APU,
								withLatestCode: false,
							}}
							volume={0}
							onError={(e) => {
								console.error(e);
							}}
							onInputType={this._setInputType}
							onFps={this._setFps}
							onStart={this._onExpectedEmulatorStart}
							onFrame={this._onExpectedFrame}
							style={{ width: "auto", height: "auto" }}
							ref={(ref) => {
								this._emulatorB = ref;
							}}
						/>
					</>
				}
			/>
		);
	}

	_onActualEmulatorStart = (emulation) => {
		this._comparer.debuggerGUI.emulationA = emulation;
	};

	_onExpectedEmulatorStart = (emulation) => {
		this._comparer.debuggerGUI.emulationB = emulation;
	};

	_onActualFrame = (frameBuffer, neees, emulation) => {
		if (this._framesA < this._testFrames) {
			this._mixA = [...emulation.channelSamples.mix];
			this._framesA++;
		}
	};

	_onExpectedFrame = (frameBuffer, neees, emulation) => {
		this.props.onFrame();

		if (this._framesB < this._testFrames) {
			this._mixB = [...emulation.channelSamples.mix];
			this._framesB++;
		}

		if (!this._comparer.debuggerGUI.didFail) {
			if (this._framesA > 0 && this._framesB > 0) {
				let success = true;
				let i = 0;
				while (success && i < this._mixA.length && i < this._mixB.length) {
					const sampleA = this._mixA[i];
					const sampleB = this._mixB[i];
					if (Math.abs(sampleA - sampleB) > SAMPLE_EPSILON) success = false;
					i++;
				}

				if (!success) {
					this._comparer.debuggerGUI.didFail = true;
					this._firstFailIndex = this._count;
				}
			}
		}

		this._count++;

		this._comparer.debuggerGUI.progressText =
			this._count + " / " + this._testFrames;

		if (this._count < this._testFrames) {
			const percentage = (this._count / this._testFrames) * 100;
			this._comparer.debuggerGUI.progressValue = percentage;
		} else {
			this._comparer.debuggerGUI.progressValue = 100;
			this._emulatorA.stop();
			this._emulatorB.stop();
			this.props.onEnd({
				success: !this._comparer.debuggerGUI.didFail,
				frame: this._firstFailIndex,
				total: this._testFrames,
			});
			this._closeButton.style.display = "block";
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

	get _volume() {
		return 0.1; // Math.max(store.getState().savedata.emulatorVolume, 0.1);
	}
}
