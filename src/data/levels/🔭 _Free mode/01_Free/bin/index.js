class Emulator {
  constructor(onFrame, onSample) {
    this.onFrame = onFrame;
    this.onSample = onSample;
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
   * `button`: One of "BUTTON_LEFT", "BUTTON_RIGHT", "BUTTON_UP", "BUTTON_DOWN", "BUTTON_A", "BUTTON_B", "BUTTON_START", "BUTTON_SELECT"
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
  }

  /**
   * Runs the emulation for `n` audio samples.
   * Used when "SYNC TO AUDIO" is active.
   */
  samples(n) {
    /* TODO: IMPLEMENT */
  }

  /**
   * Returns an object with a snapshot of the current state.
   */
  getSaveState() {
    return {}; /* TODO: IMPLEMENT */
  }

  /*
   * Restores the current state from a snapshot.
   * `saveState`: `object`
   */
  setSaveState(saveState) {
    /* TODO: IMPLEMENT */
  }
}

export default {
  Emulator
}
