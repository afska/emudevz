import Emulator from "./Emulator";
import FrameTimer from "./FrameTimer";
import Speaker from "./Speaker";

const SYNC_TO_AUDIO = true;
const AUDIO_DRIFT_THRESHOLD = 64;
const SAMPLES_PER_FRAME = Math.floor(44100 / 60.098) + 1;

export default class EmulatorFrontend {
  constructor(bytes, screen, getInput = () => [{}, {}]) {
    this.screen = screen;
    this.samples = [];

    this.speaker = new Speaker(({ need, have, target }) => {
      if (SYNC_TO_AUDIO) {
        let n = need;
        if (have > target + AUDIO_DRIFT_THRESHOLD) n--;
        else if (have < target - AUDIO_DRIFT_THRESHOLD) n++;

        // run for n samples
        this.neees.samples(n); // might send pixels to the canvas

        this._updateSound(); // sends the samples to the audio worklet
      }
    });
    this.speaker.start();

    this.neees = new Emulator(this._onFrame, this._onAudio);
    this.frameTimer = new FrameTimer(() => {
      this._updateInput(getInput());

      if (!SYNC_TO_AUDIO) {
        // run for a whole frame
        this.neees.frame(); // sends the pixels to the canvas

        if (this.samples.length !== SAMPLES_PER_FRAME)
          this.samples = this._resample(this.samples, SAMPLES_PER_FRAME);

        this._updateSound(); // sends the samples to the audio worklet
      }
    });

    this.neees.load(bytes);
    this.frameTimer.start();
  }

  terminate = () => {
    this.frameTimer.stop();
    this.speaker.stop();
  };

  _onFrame = (frameBuffer) => {
    this.screen.setBuffer(frameBuffer);
  };

  _onAudio = (sample) => {
    this.samples.push(sample);
  };

  _updateSound() {
    this.speaker.writeSamples(this.samples);
    this.samples = [];
  }

  _resample(src, target) {
    const n = src.length;
    if (n === target) return src.slice();
    if (n === 0) return new Array(target).fill(0);
    if (n === 1) return new Array(target).fill(src[0]);

    const out = new Array(target);
    for (let i = 0; i < target; i++) {
      const t = (i * (n - 1)) / (target - 1);
      const k = Math.floor(t);
      const a = src[k];
      const b = src[k + 1] ?? a;
      out[i] = a + (b - a) * (t - k);
    }

    return out;
  }

  _updateInput(input) {
    for (let i = 0; i < 2; i++) {
      for (let button in input[i])
        this.neees.setButton(i + 1, button, input[i][button]);
    }
  }
}
