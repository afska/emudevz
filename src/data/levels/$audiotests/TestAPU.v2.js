export default class APU {
	constructor(cpu) {
		this.cpu = cpu;

		this.sampleCounter = 0;
		this.sample = 0;
		this.registers = { read: () => {}, write: () => {} };
	}

	step(onSample) {
		this.sampleCounter++;

		if (this.sampleCounter === 20) {
			this.sampleCounter = 0;

			// <test>
			this.time = (this.time || 0) + 1 / 44100;
			const frequency = 440;
			const period = 1 / frequency;
			const dutyCycle = 0.5;
			this.sample = this.time % period < period * dutyCycle ? 1 : 0;
			// </test>

			onSample(this.sample);
		}
	}
}
