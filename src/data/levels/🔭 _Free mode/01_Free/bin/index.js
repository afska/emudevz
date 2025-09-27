const WIDTH = 240;
const HEIGHT = 160;
const SAMPLE_RATE_HZ = 44100;
const VIDEO_FRAMES_PER_SECOND = 60;
const SAMPLES_PER_FRAME = SAMPLE_RATE_HZ / VIDEO_FRAMES_PER_SECOND;

class Emulator {
  constructor(onFrame, onSample) {
    this.onFrame = onFrame;
    this.onSample = onSample;

    // <test>
    this._frameBuffer = new Uint32Array(WIDTH * HEIGHT);
    this._frameIndex = 0;
    this._samplesSinceFrame = 0;
    this._phase = 0;
    // </test>
  }

  /**
   * Loads a ROM file.
   * `bytes`: `Uint8Array`
   * `saveFileBytes`: `Uint8Array`
   */
  load(bytes, saveFileBytes) {
    /* TODO: IMPLEMENT */
  }

  /**
   * Updates a button's state.
   * `playerId`: `1` or `2`
   * `button`: One of "BUTTON_LEFT", "BUTTON_RIGHT", "BUTTON_UP", "BUTTON_DOWN", "BUTTON_A", "BUTTON_B", "BUTTON_X", "BUTTON_Y", "BUTTON_L", "BUTTON_R", "BUTTON_START", "BUTTON_SELECT"
   * `isPressed`: `boolean`
   */
  setButton(playerId, button, isPressed) {
    /* TODO: IMPLEMENT */
  }

  /**
   * Runs the emulation for a whole frame.
   * Used when "SYNC TO VIDEO" is active.
   */
  frame() {
    /* TODO: IMPLEMENT */

    this._generateVideo();
    this._generateAudio(SAMPLES_PER_FRAME);
  }

  /**
   * Runs the emulation for `n` audio samples.
   * Used when "SYNC TO AUDIO" is active.
   * `n`: `number`
   */
  samples(n) {
    /* TODO: IMPLEMENT */

    this._generateAudio(n);

    this._samplesSinceFrame += n;
    while (this._samplesSinceFrame >= SAMPLES_PER_FRAME) {
      this._samplesSinceFrame -= SAMPLES_PER_FRAME;
      this._generateVideo();
    }
  }

  /**
   * Returns an array with the save file bytes, or null if the game doesn't have a save file.
   */
  getSaveFile() {
    return null; /* TODO: IMPLEMENT */
  }

  /**
   * Returns an object with a snapshot of the current state.
   */
  getSaveState() {
    return {}; /* TODO: IMPLEMENT */
  }

  /*
   * Restores the current state from a snapshot.
   * `saveState`: the object returned by `getSaveState()`
   */
  setSaveState(saveState) {
    /* TODO: IMPLEMENT */
  }

  // <test>
  _generateVideo() {
    this._frameIndex++;
    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        this._frameBuffer[y * WIDTH + x] = 0xff000000 | this._frameIndex % 0xff;
      }
    }
    this.onFrame(this._frameBuffer);
  }

  _generateAudio(sampleCount) {
    const phaseIncrement = (2 * Math.PI * 440) / SAMPLE_RATE_HZ;
    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
      this.onSample(Math.sin(this._phase) * 0.25);
      this._phase += phaseIncrement;
    }
  }
  // </test>
}

export default {
  Emulator,
};
