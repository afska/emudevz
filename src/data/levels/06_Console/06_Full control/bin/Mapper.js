/**
 * An abstract class that represents a generic mapper.
 * It's connected to two different memory areas:
 * - CPU $4020-$FFFF (for PRG ROM, PRG RAM, and mapper registers)
 * - PPU $0000-$1FFF (for CHR ROM / Pattern tables)
 */
export default class Mapper {
  constructor(cpu, ppu, cartridge) {
    this.cpu = cpu;
    this.ppu = ppu;
    this.cartridge = cartridge;

    const prg = this.cartridge.prg();
    const chr = this.cartridge.chr();
    const totalPrgPages = Math.floor(prg.length / this.prgRomPageSize());
    const totalChrPages = Math.floor(chr.length / this.chrRomPageSize());

    this.prgPages = [];
    for (let i = 0; i < totalPrgPages; i++)
      this.prgPages.push(this._getPage(prg, this.prgRomPageSize(), i));

    this.chrPages = [];
    for (let i = 0; i < totalChrPages; i++)
      this.chrPages.push(this._getPage(chr, this.chrRomPageSize(), i));

    this.onLoad();
  }

  /** Returns the PRG ROM page size (in bytes). */
  prgRomPageSize() {
    return 16 * 1024;
  }

  /** Returns the CHR ROM page size (in bytes). */
  chrRomPageSize() {
    return 8 * 1024;
  }

  /** Called when instantiating the mapper. */
  onLoad() {}

  /** Maps a CPU read operation (`address` is in CPU range $4020-$FFFF). */
  cpuRead(address) {
    throw new Error("not_implemented");
  }

  /** Maps a CPU write operation (`address` is in CPU range $4020-$FFFF). */
  cpuWrite(address, value) {
    throw new Error("not_implemented");
  }

  /** Maps a PPU read operation (`address` is in PPU range $0000-$1FFF). */
  ppuRead(address) {
    throw new Error("not_implemented");
  }

  /** Maps a PPU write operation (`address` is in PPU range $0000-$1FFF). */
  ppuWrite(address, value) {
    throw new Error("not_implemented");
  }

  /**
   * Runs at cycle 260 of every scanline (including preline).
   */
  tick() {}

  /** Returns a snapshot of the current state. */
  getSaveState() {
    return {
      chrPages: this.cartridge.header.usesChrRam
        ? this.chrPages.map((it) => Array.from(it))
        : null
    };
  }

  /** Restores state from a snapshot. */
  setSaveState(saveState) {
    if (saveState.chrPages != null)
      this.chrPages = saveState.chrPages.map((it) => new Uint8Array(it));
  }

  /** Returns a PRG `page`, wrapping if needed. */
  $getPrgPage(page) {
    return this.prgPages[Math.max(0, page % this.prgPages.length)];
  }

  /** Returns a CHR `page`, wrapping if needed. */
  $getChrPage(page) {
    return this.chrPages[Math.max(0, page % this.chrPages.length)];
  }

  _getPage(memory, pageSize, page) {
    const offset = page * pageSize;
    return memory.slice(offset, offset + pageSize);
  }
}
