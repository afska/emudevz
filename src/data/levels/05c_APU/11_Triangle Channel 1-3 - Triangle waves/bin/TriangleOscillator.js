const APU_SAMPLE_RATE = 44100;
const TRIANGLE_SEQUENCE = [
  15,
  14,
  13,
  12,
  11,
  10,
  9,
  8,
  7,
  6,
  5,
  4,
  3,
  2,
  1,
  0,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15
];

/** A triangle wave generator. */
export default class TriangleOscillator {
  constructor() {
    this.frequency = 0;

    this._phase = 0; // (0~1)
  }

  /** Generates a new sample (0~15). */
  sample() {
    this._phase = (this._phase + this.frequency / APU_SAMPLE_RATE) % 1;
    const step = Math.floor(this._phase * TRIANGLE_SEQUENCE.length);

    return TRIANGLE_SEQUENCE[step];
  }
}
