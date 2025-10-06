import React, { PureComponent } from "react";
import { FaTimes } from "react-icons/fa";
import Level from "../../../level/Level";
import locales from "../../../locales";
import store from "../../../store";
import testContext from "../../../terminal/commands/test/context";
import { bus } from "../../../utils";
import AudioComparer from "../debugger/AudioComparer";
import IconButton from "../widgets/IconButton";
import Emulator from "./Emulator";
import styles from "./AudioTester.module.css";

const MIN_VOLUME = 0.1;
const SAMPLE_EPSILON = 1e-4;
const SAMPLE_GROUP = () => ({
	mix: [],
	pulse1: [],
	pulse2: [],
	triangle: [],
	noise: [],
	dmc: [],
});

export default class AudioTester extends PureComponent {
	_samples = {
		A: SAMPLE_GROUP(),
		B: SAMPLE_GROUP(),
	};
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
			this._samples.A = emulation.channelSamples;
			this._framesA++;
		} else {
			this._emulatorA.stop();
			this._onEnd();
		}
	};

	_onExpectedFrame = (frameBuffer, neees, emulation) => {
		this.props.onFrame();

		if (this._framesB < this._testFrames) {
			this._samples.B = emulation.channelSamples;
			this._framesB++;
		}

		if (!this._comparer.debuggerGUI.didFail) {
			if (this._framesA > 0 && this._framesB > 0) {
				let success = true;
				let i = 0;
				while (
					success &&
					i < this._samples.A.mix.length &&
					i < this._samples.B.mix.length
				) {
					const sampleA = this._samples.A.mix[i];
					const sampleB = this._samples.B.mix[i];
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
			this._emulatorB.stop();
			this._onEnd();
		}
	};

	_onEnd = () => {
		if (this._framesA === this._framesB) {
			this._comparer.debuggerGUI.finalSamples = this._generateFinalSamples();

			const channels = Object.keys(this._samples.A);
			channels.forEach((channel) => {
				const lengthA = this._samples.A[channel].length;
				const lengthB = this._samples.B[channel].length;
				const minLength = Math.min(lengthA, lengthB);

				this._comparer.debuggerGUI.finalSamples.A[
					channel
				] = this._comparer.debuggerGUI.finalSamples.A[channel].slice(
					0,
					minLength
				);
				this._comparer.debuggerGUI.finalSamples.B[
					channel
				] = this._comparer.debuggerGUI.finalSamples.B[channel].slice(
					0,
					minLength
				);
			});

			this._comparer.debuggerGUI.progressValue = 100;
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

	_setFps = () => {};

	_generateFinalSamples() {
		const finalSamples = JSON.parse(JSON.stringify(this._samples)); // (deep clone)

		const channels = Object.keys(finalSamples.A);
		channels.forEach((channel) => {
			const lengthA = finalSamples.A[channel].length;
			const lengthB = finalSamples.B[channel].length;
			const minLength = Math.min(lengthA, lengthB);
			finalSamples.A[channel] = finalSamples.A[channel].slice(0, minLength);
			finalSamples.B[channel] = finalSamples.B[channel].slice(0, minLength);
		});

		return finalSamples;
	}

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

	componentDidMount() {
		this._subscriber = bus.subscribe({
			"music-volume-changed": (newVolume) => {
				if (this._emulatorA?.speaker)
					this._emulatorA?.speaker.setVolume(Math.max(newVolume, MIN_VOLUME));
			},
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	get _volume() {
		return Math.max(store.getState().savedata.musicVolume, MIN_VOLUME);
	}
}
