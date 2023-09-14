export default class PPUMemory {
  constructor() {
    /* TODO: IMPLEMENT */
  }

  onLoad(cartridge, mapper) {
    this.cartridge = cartridge;
    this.mapper = mapper;
  }

  read(address) {
    // 🕊️ Pattern tables 0 and 1 (mapper)
    /* TODO: IMPLEMENT */

    // 🏞️ Name tables 0 to 3 (VRAM + mirror)
    /* TODO: IMPLEMENT */

    // 🚽 Mirrors of $2000-$2EFF
    if (address >= 0x3000 && address <= 0xeff)
      return this.read(0x2000 + ((address - 0x3000) % 0x1000));

    // 🎨 Palette RAM
    /* TODO: IMPLEMENT */

    // 🚽 Mirrors of $3F00-$3F1F
    if (address >= 0x3f20 && address <= 0x3fff)
      return this.read(0x3f00 + ((address - 0x3f20) % 0x0020));

    return 0;
  }

  write(address, value) {
    // 🕊️ Pattern tables 0 and 1 (mapper)
    /* TODO: IMPLEMENT */

    // 🏞️ Name tables 0 to 3 (VRAM + mirror)
    /* TODO: IMPLEMENT */

    // 🚽 Mirrors of $2000-$2EFF
    if (address >= 0x3000 && address <= 0xeff)
      return this.write(0x2000 + ((address - 0x3000) % 0x1000), value);

    // 🎨 Palette RAM
    /* TODO: IMPLEMENT */

    // 🚽 Mirrors of $3F00-$3F1F
    if (address >= 0x3f20 && address <= 0x3fff)
      return this.write(0x3f00 + ((address - 0x3f20) % 0x0020), value);
  }
}
