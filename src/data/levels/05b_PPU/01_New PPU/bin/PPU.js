export default class PPU {
  constructor(cpu) {
    this.cpu = cpu;

    this.cycle = 0;
    this.scanline = -1;
    this.frame = 0;
  }

  step() {
    /* TODO: IMPLEMENT */
  }
}
