export default class APU {
	constructor(cpu) {
		this.cpu = cpu;

		this.time = 0;
		this.sampleCounter = 0;
		this.sample = 0;
	}

	step(onSample) {
		this.sampleCounter++;

		if (this.sampleCounter === 20) {
			this.sampleCounter = 0;
			this.time += 1 / 44100;

			const frequency = 440;
			const period = 1 / frequency;
			const dutyCycle = 0.5;
			this.sample = this.time % period < period * dutyCycle ? 1 : 0;

			onSample(this.sample);
		}
	}
}
