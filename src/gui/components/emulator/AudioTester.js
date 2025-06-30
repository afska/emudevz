import React, { PureComponent } from "react";
import { FaTimes } from "react-icons/fa";
import Level from "../../../level/Level";
import locales from "../../../locales";
import store from "../../../store";
import testContext from "../../../terminal/commands/test/context";
import AudioComparer from "../debugger/AudioComparer";
// import { bus } from "../../../utils"; // TODO: USE? FINISH IMPLEMENTATION
import IconButton from "../widgets/IconButton";
import Emulator from "./Emulator";
import styles from "./AudioTester.module.css";

export default class AudioTester extends PureComponent {
	_samplesA = {
		comparedMix: [],
		mix: [],
		pulse1: [],
		pulse2: [],
		triangle: [],
		noise: [],
		dmc: [],
	};
	_samplesB = {
		comparedMix: [],
		mix: [],
		pulse1: [],
		pulse2: [],
		triangle: [],
		noise: [],
		dmc: [],
	};
	_framesA = 0;
	_framesB = 0;
	_count = 0;

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
			for (let i = 0; i < emulation.channelSamples.mix.length; i++) {
				this._samplesA.comparedMix.push(emulation.channelSamples.mix[i]);
				this._samplesA.mix.push(emulation.channelSamples.mix[i]);
				this._samplesA.pulse1.push(emulation.channelSamples.pulse1[i]);
				this._samplesA.pulse2.push(emulation.channelSamples.pulse2[i]);
				this._samplesA.triangle.push(emulation.channelSamples.triangle[i]);
				this._samplesA.noise.push(emulation.channelSamples.noise[i]);
				this._samplesA.dmc.push(emulation.channelSamples.dmc[i]);
			}

			emulation.channelSamples.mix.length = 0;
			emulation.channelSamples.pulse1.length = 0;
			emulation.channelSamples.pulse2.length = 0;
			emulation.channelSamples.triangle.length = 0;
			emulation.channelSamples.noise.length = 0;
			emulation.channelSamples.dmc.length = 0;

			this._framesA++;
		}
	};

	_onExpectedFrame = (frameBuffer, neees, emulation) => {
		this.props.onFrame();

		if (this._framesB < this._testFrames) {
			for (let i = 0; i < emulation.channelSamples.mix.length; i++) {
				this._samplesB.comparedMix.push(emulation.channelSamples.mix[i]);
				this._samplesB.mix.push(emulation.channelSamples.mix[i]);
				this._samplesB.pulse1.push(emulation.channelSamples.pulse1[i]);
				this._samplesB.pulse2.push(emulation.channelSamples.pulse2[i]);
				this._samplesB.triangle.push(emulation.channelSamples.triangle[i]);
				this._samplesB.noise.push(emulation.channelSamples.noise[i]);
				this._samplesB.dmc.push(emulation.channelSamples.dmc[i]);
			}

			emulation.channelSamples.mix.length = 0;
			emulation.channelSamples.pulse1.length = 0;
			emulation.channelSamples.pulse2.length = 0;
			emulation.channelSamples.triangle.length = 0;
			emulation.channelSamples.noise.length = 0;
			emulation.channelSamples.dmc.length = 0;

			this._framesB++;
		}

		if (this._framesA > 0 && this._framesB > 0) {
			let success = true;
			while (
				success &&
				this._samplesA.comparedMix.length > 0 &&
				this._samplesB.comparedMix.length > 0
			) {
				const sampleA = this._samplesA.comparedMix.shift();
				const sampleB = this._samplesB.comparedMix.shift();

				if (sampleA !== sampleB) success = false;
			}

			if (!success) {
				this._emulatorA.stop();
				this._emulatorB.stop();
				// this._symbol.innerHTML = "❌";
				this.props.onEnd({
					success,
					frame: this._count,
					total: this._testFrames,
				});
				// this._progressBar.setBarFillColor("#d9534f");
				this._closeButton.style.display = "block";

				// this._checkDiffsButton.style.display = "block";
				return;
			}

			this._count++;

			if (this._count < this._testFrames) {
				const percentage = (this._count / this._testFrames) * 100;
				// this._progressBar.setPercentage(percentage);
				// this._detail.innerHTML = this._count + " / " + this._testFrames;
			} else {
				// this._progressBar.setPercentage(100);
				this.props.onEnd({ success: true });
				// this._detail.innerHTML = this._count + " / " + this._testFrames;
			}
		}
	};

	_checkDiffs = () => {
		// bus.emit("image-diff", this._screenshotB, this._screenshotA);
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
		return Math.max(store.getState().savedata.emulatorVolume, 0.1);
	}
}
