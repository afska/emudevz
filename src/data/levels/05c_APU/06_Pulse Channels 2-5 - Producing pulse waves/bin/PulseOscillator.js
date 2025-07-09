const APU_SAMPLE_RATE = 44100;
const DUTY_TABLE = [0.125, 0.25, 0.5, 0.75];

/** A pulse wave generator. */
export default class PulseOscillator {
  constructor() {
    this.frequency = 0;
    this.dutyCycle = 0; // (0~3)
    this.volume = 15; // (0~5)

    this._phase = 0; // (0~1)
  }

  /** Generates a new sample (0~15). */
  sample() {
    this._phase = (this._phase + this.frequency / APU_SAMPLE_RATE) % 1;

    return this._phase < DUTY_TABLE[this.dutyCycle] ? this.volume : 0;
  }
}
