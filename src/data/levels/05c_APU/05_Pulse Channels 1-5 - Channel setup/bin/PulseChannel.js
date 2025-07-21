import byte from "/lib/byte";

export default class PulseChannel {
  constructor(apu, id, enableFlagName) {
    this.apu = apu;

    this.id = id;
    this.enableFlagName = enableFlagName;

    this.timer = 0;
    this.registers = this.apu.registers.pulses[this.id];
  }

  sample() {
    /* TODO: IMPLEMENT */
    return 0;
  }

  updateTimer() {
    this.timer = byte.buildU16(
      this.registers.timerHighLCL.timerHigh,
      this.registers.timerLow.value
    );
  }

  step() {
    this.updateTimer();
  }

  isEnabled() {
    return !!this.apu.registers.apuControl[this.enableFlagName];
  }
}
