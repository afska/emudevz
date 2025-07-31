export default class DMCChannel {
  constructor(apu, cpu) {
    this.apu = apu;
    this.cpu = cpu;

    this.registers = this.apu.registers.dmc;

    this.outputSample = 0;
  }

  sample() {
    return this.outputSample;
  }

  step() {
    /* TODO: IMPLEMENT */
  }
}
