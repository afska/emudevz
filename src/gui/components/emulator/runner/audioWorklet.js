import RingBuffer from "ringbufferjs";

const AUDIO_BUFFER_SIZE = 4096;
const MAX_IN_FLIGHT = 10;

class PlayerWorklet extends AudioWorkletProcessor {
	constructor() {
		super();

		this.buffer = new RingBuffer(AUDIO_BUFFER_SIZE);
		this.inFlight = 0;

		this.port.onmessage = (event) => {
			for (let sample of event.data) this.buffer.enq(sample);
			if (this.inFlight > 0) this.inFlight--;
		};
	}

	process(inputs, outputs) {
		const output = outputs[0][0];
		const size = output.length;

		try {
			const samples = this.buffer.deqN(size);
			for (let i = 0; i < size; i++) output[i] = samples[i];
		} catch (e) {
			// buffer underrun (needed {size}, got {this.buffer.size()})
			// ignore empty buffers... assume audio has just stopped
			for (let i = 0; i < size; i++) output[i] = 0;
		}

		// request new samples
		const need = size;
		const have = this.buffer.size();
		const target = AUDIO_BUFFER_SIZE / 2;
		if (this.inFlight < MAX_IN_FLIGHT) {
			this.port.postMessage({ need, have, target });
			this.inFlight++;
		}

		return true;
	}
}

registerProcessor("player-worklet", PlayerWorklet);
