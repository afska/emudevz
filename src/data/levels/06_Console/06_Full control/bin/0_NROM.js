import Mapper from "/lib/Mapper";

/**
 * The simplest mapper (also called "Mapper 0").
 * It can have either one or two PRG ROM of 16KB, which are mapped
 * at ranges $8000-$BFFF and $C000-$FFFF of the CPU memory.
 * It also has CHR ROM which contains the tile and sprite data.
 * This CHR ROM is mapped to the PPU memory at addresses $0000-$1FFF.
 */
export default class NROM extends Mapper {
  cpuRead(address) {
    if (address >= 0x4020 && address <= 0x7fff) {
      // Unused
      return 0;
    } else if (address >= 0x8000 && address <= 0xbfff) {
      // CPU $8000-$BFFF: First 16 KB of PRG-ROM
      return this.$getPrgPage(0)[address - 0x8000];
    } else if (address >= 0xc000 && address <= 0xffff) {
      // CPU $C000-$FFFF: Last 16 KB of PRG-ROM (or mirror of $8000-$BFFF)
      return this.$getPrgPage(1)[address - 0xc000];
    }
  }

  cpuWrite(address, value) {
    // Unused
  }

  ppuRead(address) {
    // PPU $0000-$1FFF: 8 KB of CHR-ROM (or CHR-RAM)
    return this.$getChrPage(0)[address];
  }

  ppuWrite(address, value) {
    if (!this.cartridge.header.usesChrRam) {
      return; // (only CHR-RAM is writable)
    }

    // PPU $0000-$1FFF: 8 KB of CHR-RAM
    this.$getChrPage(0)[address] = value;
  }
}
