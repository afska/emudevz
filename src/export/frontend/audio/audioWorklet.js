import config from "../config.js";
import RingBuffer from "./RingBuffer.js";

class PlayerWorklet extends AudioWorkletProcessor {
	constructor() {
		super();

		this.buffer = new RingBuffer(config.AUDIO_BUFFER_SIZE);

		this.port.onmessage = (e) => {
			for (let sample of e.data) this.buffer.enq(sample);
		};
	}

	process(inputs, outputs) {
		const output = outputs[0][0];
		const size = output.length;

		try {
			const samples = this.buffer.deqN(size);
			for (let i = 0; i < size; i++) output[i] = samples[i];
		} catch (err) {
			for (let i = 0; i < size; i++) output[i] = 0;
		}

		this.port.postMessage({
			need: size,
			have: this.buffer.size(),
		});

		return true;
	}
}

registerProcessor("player-worklet", PlayerWorklet);
