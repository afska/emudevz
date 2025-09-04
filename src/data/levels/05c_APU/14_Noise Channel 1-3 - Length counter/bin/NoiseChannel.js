import LengthCounter from "./LengthCounter";
/* TODO: Check your LengthCounter path ^^^ */

export default class NoiseChannel {
  constructor(apu) {
    this.apu = apu;

    this.registers = this.apu.registers.noise;

    this.lengthCounter = new LengthCounter();
  }

  sample() {
    if (!this.isEnabled() || !this.lengthCounter.isActive()) return 0;

    const volume = this.registers.control.volumeOrEnvelopePeriod;

    return Math.floor(this.random() * volume);
  }

  step() {
    /* TODO: IMPLEMENT */
  }

  quarterFrame() {
    /* TODO: IMPLEMENT */
  }

  halfFrame() {
    this.lengthCounter.clock(
      this.isEnabled(),
      this.registers.control.envelopeLoopOrLengthCounterHalt
    );
  }

  isEnabled() {
    return !!this.apu.registers.apuControl.enableNoise;
  }

  random() {
		if (this.s == null) this.s = 0x9e3779b9;
		this.s = (this.s * 1664525 + 1013904223) >>> 0;
		return this.s / 4294967296;
	}
}
