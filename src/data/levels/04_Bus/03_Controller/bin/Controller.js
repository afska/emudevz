const BUTTONS = [
  "BUTTON_A",
  "BUTTON_B",
  "BUTTON_SELECT",
  "BUTTON_START",
  "BUTTON_UP",
  "BUTTON_DOWN",
  "BUTTON_LEFT",
  "BUTTON_RIGHT"
];

export default class Controller {
  constructor(player) {
    this.strobe = false;
    this.cursor = 0;
    this.other = null;

    this._player = player;
    this._buttons = [false, false, false, false, false, false, false, false];
  }

  update(button, isPressed) {
    const index = BUTTONS.indexOf(button);
    this._buttons[index] = isPressed;
  }

  onRead() {
    /* TODO: IMPLEMENT */

    return 0;
  }

  onWrite(value) {
    /* TODO: IMPLEMENT */
  }
}
