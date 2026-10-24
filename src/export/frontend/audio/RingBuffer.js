export default class RingBuffer {
	constructor(capacity) {
		this.buffer = new Float32Array(capacity);
		this.offset = 0;
		this.length = 0;
	}

	enq(value) {
		this.buffer[(this.offset + this.length) % this.buffer.length] = value;

		if (this.length < this.buffer.length) this.length++;
		else this.offset = (this.offset + 1) % this.buffer.length;
	}

	deqN(count) {
		if (count > this.length) throw new Error("Not enough samples");

		const samples = new Float32Array(count);
		for (let i = 0; i < count; i++)
			samples[i] = this.buffer[(this.offset + i) % this.buffer.length];

		this.offset = (this.offset + count) % this.buffer.length;
		this.length -= count;

		return samples;
	}

	size() {
		return this.length;
	}
}
