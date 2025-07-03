import React, { PureComponent } from "react";
import store from "../../../store";
import { bus } from "../../../utils";
import Emulator from "./Emulator";

export default class DemoEmulatorRunner extends PureComponent {
	render() {
		const { rom, saveState } = this.props;

		return (
			<Emulator
				rom={rom}
				saveState={saveState}
				settings={{ useHardware: true }}
				volume={this._volume}
				onError={() => {}}
				onInputType={() => {}}
				onFps={() => {}}
				ref={(ref) => {
					this._emulator = ref;
				}}
			/>
		);
	}

	componentDidMount() {
		this._subscriber = bus.subscribe({
			"music-volume-changed": (newVolume) => {
				if (this._emulator?.speaker)
					this._emulator?.speaker.setVolume(newVolume);
			},
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	get _volume() {
		return store.getState().savedata.musicVolume;
	}
}
