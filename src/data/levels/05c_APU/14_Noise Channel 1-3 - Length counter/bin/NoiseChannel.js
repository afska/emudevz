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

    return Math.floor(Math.random() * volume);
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
}
