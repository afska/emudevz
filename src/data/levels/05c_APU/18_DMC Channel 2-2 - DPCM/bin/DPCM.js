import byte from "../byte";

/**
 * DPCM (Δ-Modulation) channel handler.
 * Manages sample playback: fetching bits, looping, and outputting variations.
 */
export default class DPCM {
  constructor(dmcChannel) {
    this.dmcChannel = dmcChannel;

    this.startFlag = false;
    this.isActive = false;
    this.buffer = null;
    this.cursorByte = 0;
    this.cursorBit = 0;
    this.dividerPeriod = 0;
    this.dividerCount = 0;
    this.sampleAddress = 0;
    this.sampleLength = 0;
  }

  /**
   * Called each APU cycle to handle DPCM timing, sample fetching,
   * bit processing, output variation, and looping.
   */
  update() {
    if (this.startFlag) {
      const dividerPeriod = dpcmPeriods[this.registers.control.dpcmPeriodId];

      this.startFlag = false;
      this.isActive = true;
      this.cursorByte = -1;
      this.cursorBit = 0;
      this.dividerPeriod = dividerPeriod;
      this.dividerCount = dividerPeriod - 1;

      // sample address = %11AAAAAA.AA000000 = $C000 + (A * 64)
      this.sampleAddress = 0xc000 + this.registers.sampleAddress.value * 64;
      // sample length = %LLLL.LLLL0001 = (L * 16) + 1 bytes
      this.sampleLength = this.registers.sampleLength.value * 16 + 1;
    }

    if (!this.isActive) return;

    this.dividerCount++;
    if (this.dividerCount >= this.dividerPeriod) this.dividerCount = 0;
    else return;

    const needFetch = this.buffer === null || this.cursorBit === 8;
    if (needFetch) {
      const nextByte = this.cursorByte + 1;

      if (nextByte >= this.sampleLength) {
        this.isActive = false;
        this.buffer = null;
        if (this.registers.control.loop) this.start();
        return;
      }

      this.cursorByte = nextByte;
      this.cursorBit = 0;

      let address = this.sampleAddress + this.cursorByte;
      if (address > 0xffff) {
        // (if it exceeds $FFFF, it is wrapped around to $8000)
        address = 0x8000 + (address % 0x10000);
      }
      this.buffer = this.cpu.memory.read(address);
    }

    const variation = byte.getBit(this.buffer, this.cursorBit) ? 2 : -2;
    const newSample = this.dmcChannel.outputSample + variation;
    if (newSample >= 0 && newSample <= 127)
      this.dmcChannel.outputSample = newSample;

    this.cursorBit++;
  }

  /**
   * Sets the startFlag so playback begins on next update.
   */
  start() {
    this.startFlag = true;
  }

  /**
   * Stops playback immediately by moving cursor to sample end.
   */
  stop() {
    this.cursorByte = this.sampleLength;
  }

  /**
   * Returns remaining bytes in sample, or 0 if inactive.
   */
  remainingBytes() {
    if (!this.isActive) return 0;
    return Math.max(0, this.sampleLength - (this.cursorByte + 1));
  }

  get cpu() {
    return this.dmcChannel.cpu;
  }

  get registers() {
    return this.dmcChannel.registers;
  }
}

/**
 * A list of all DPCM periods. The `DMCControl` register points to this table.
 */
const dpcmPeriods = [
  214,
  190,
  170,
  160,
  143,
  127,
  113,
  107,
  95,
  80,
  71,
  64,
  53,
  42,
  36,
  27
];
